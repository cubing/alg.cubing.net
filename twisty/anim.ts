"use strict";

namespace Twisty {
export namespace Anim {

// The values are animation scaling factors.
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1
}

enum BreakPointType {
  Move,
  EntireMoveSequence
}

// TODO: Extend `number`, introduce MoveSequenceTimeStamp vs. EpochTimeStamp,
// force Duration to be a difference.
export type Duration = number; // Duration in milliseconds
type TimeStamp = Duration; // Duration since a particular epoch.

export interface CursorObserver {
  animCursorChanged: (cursor: Duration) => void;
}

export interface DirectionObserver {
  animDirectionChanged: (direction: Direction) => void;
}

// export interface BoundsObserver {
//   animBoundsChanged: (start: Duration, end: Duration) => void;
// }

// TODO: Use generics to unify handling the types of observers.
export class Dispatcher implements CursorObserver, DirectionObserver {
  private cursorObservers: Set<CursorObserver> = new Set<CursorObserver>();
  private directionObservers: Set<DirectionObserver> = new Set<DirectionObserver>();

  registerCursorObserver(observer: CursorObserver) {
    if (this.cursorObservers.has(observer)) {
      throw "Duplicate cursor observer added.";
    }
    this.cursorObservers.add(observer);
  }

  registerDirectionObserver(observer: DirectionObserver) {
    if (this.directionObservers.has(observer)) {
      throw "Duplicate direction observer added.";
    }
    this.directionObservers.add(observer);
  }

  animCursorChanged(cursor: Duration) {
    // TODO: guard against nested changes and test.
    for (var observer of this.cursorObservers) {
      observer.animCursorChanged(cursor);
    }
  }

  animDirectionChanged(direction: Direction) {
    // TODO: guard against nested changes and test.
    for (var observer of this.directionObservers) {
      observer.animDirectionChanged(direction);
    }
  }
}

export class Model {
  private cursor: Duration = 0;
  private lastCursorTime: TimeStamp = 0;
  private direction: Direction = Direction.Paused;
  private breakPointType: BreakPointType = BreakPointType.EntireMoveSequence;
  private scheduler: FrameScheduler;
  private tempo: number = 1; // TODO: Support setting tempo.
  public dispatcher: Dispatcher = new Dispatcher();
  // TODO: cache breakpoints instead of re-querying the model constantly.
  constructor(private breakPointModel: BreakPointModel) {
    this.scheduler = new FrameScheduler(this.frame.bind(this));
  }

  public getCursor(): Duration {
    return this.cursor;
  }

  public getBounds(): Duration[] {
    return [
      this.breakPointModel.firstBreakPoint(),
      this.breakPointModel.lastBreakPoint()
    ];
  }

  private timeScaling(): number {
    return this.direction * this.tempo;
  }

  // Update the cursor based on the time since lastCursorTime, and reset
  // lastCursorTime.
  private updateCursor(timeStamp: TimeStamp) {
    if (this.direction === Direction.Paused) {
      this.lastCursorTime = timeStamp;
      return;
    }

    var previousCursor = this.cursor;

    var elapsed = timeStamp - this.lastCursorTime;
    // Workaround for the first frame: https://twitter.com/lgarron/status/794846097445269504
    if (elapsed < 0) {
      elapsed = 0;
    }
    this.cursor += elapsed * this.timeScaling();
    this.lastCursorTime = timeStamp;

    // Check if we've passed a breakpoint
    // TODO: check if we've gone off the end.
    var breakPoint = this.breakPointModel.breakPoint(this.direction, this.breakPointType, previousCursor);

    var isForwards = (this.direction === Direction.Forwards);
    var isPastBreakPoint = isForwards ?
      (this.cursor > breakPoint) :
      (this.cursor < breakPoint);
    if (isPastBreakPoint) {
        this.cursor = breakPoint;
        this.setDirection(Direction.Paused);
        this.scheduler.stop();
    }
  }

  private setDirection(direction: Direction) {
    // TODO: Handle in frame for debouncing?
    // (Are there any use cases that need synchoronous observation?)
    this.direction = direction;
    this.dispatcher.animDirectionChanged(direction);
  }

  private frame(timeStamp: TimeStamp) {
    this.updateCursor(timeStamp);
    this.dispatcher.animCursorChanged(this.cursor);
  }

  // TODO: Push this into breakPointModel.
  private setBreakPointType(breakPointType: BreakPointType) {
    this.breakPointType = breakPointType;
  }

  private isPaused() {
    return this.direction === Direction.Paused;
  }

  // Animate or pause in the given direction.
  // Idempotent.
  private animateDirection(direction: Direction): void {
    if (this.direction === direction) {
      return;
    }

    // Update cursor based on previous direction.
    this.updateCursor(performance.now());

    // Start the new direction.
    this.setDirection(direction);
    if (direction === Direction.Paused) {
      this.scheduler.stop();
    } else {
      this.scheduler.start();
    }
  }

  public skipAndPauseTo(duration: Duration): void {
    this.pause();
    this.cursor = duration;
    this.scheduler.singleFrame();
  }

  playForward(): void {
    this.setBreakPointType(BreakPointType.EntireMoveSequence);
    this.animateDirection(Direction.Forwards);
  }

  // A simple wrapper for animateDirection(Paused).
  pause(): void {
    this.animateDirection(Direction.Paused);
  }

  playBackward(): void {
    this.setBreakPointType(BreakPointType.EntireMoveSequence);
    this.animateDirection(Direction.Backwards);
  }

  skipToStart(): void {
    this.skipAndPauseTo(this.breakPointModel.firstBreakPoint());
  }

  skipToEnd(): void {
    this.skipAndPauseTo(this.breakPointModel.lastBreakPoint());
  }

  stepForward(): void {
    this.setBreakPointType(BreakPointType.Move);
    this.animateDirection(Direction.Forwards);
  }

  stepBackward(): void {
    this.setBreakPointType(BreakPointType.Move);
    this.animateDirection(Direction.Backwards);
  }

  togglePausePlayForward(): void {
    if (this.isPaused()) {
      this.playForward();
    } else {
      this.pause();
    }
  }
}


class FrameScheduler {
  private animating: boolean = false;
  constructor(private callback: (timeStamp: TimeStamp) => void) {}

  animFrame(timeStamp: TimeStamp) {
    this.callback(timeStamp);
    if (this.animating) {
      // TODO: use same bound frame instead of creating a new binding each frame.
      requestAnimationFrame(this.animFrame.bind(this));
    }
  }

  // Start scheduling frames if not already running.
  // Idempotent.
  start(): void {
    if (!this.animating) {
      this.animating = true;
      requestAnimationFrame(this.animFrame.bind(this));
    }
  }

  // Stop scheduling frames (if not already stopped).
  // Idempotent.
  stop(): void {
    this.animating = false;
  }

  singleFrame() {
    // Instantaneously start and stop, since that schedules a single frame iff
    // there is not already one scheduled.
    this.start();
    this.stop();
  }
}

// TODO: Handle different types of breakpoints:
// - Move
// - Line
// - Start/end of move sequence.
// - "section" (e.g. scramble section, solve section)
export interface BreakPointModel {
  firstBreakPoint(): Duration;
  lastBreakPoint(): Duration;
  // TODO: Define semantics if `duration` is past the end.
  breakPoint(direction: Direction, breakPointType: BreakPointType, duration: Duration): Duration;
}

export class SimpleBreakPoints implements BreakPointModel {
    // Assumes breakPointList is sorted.
    constructor(private breakPointList: Duration[]) {}

    firstBreakPoint() {
      return this.breakPointList[0];
    }
    lastBreakPoint() {
      return this.breakPointList[this.breakPointList.length - 1];
    }

    breakPoint(direction: Direction, breakPointType: BreakPointType, duration: Duration) {
      if (direction === Direction.Backwards) {
        var l = this.breakPointList.filter(d2 => d2 < duration);
        if (l.length === 0 || breakPointType === BreakPointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakPointType == EntireMoveSequence
          return this.firstBreakPoint();
        }
        return l[l.length - 1];
      } else {
        var l = this.breakPointList.filter(d2 => d2 > duration);
        if (l.length === 0 || breakPointType === BreakPointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakPointType == EntireMoveSequence
          return this.lastBreakPoint();
        }
        return l[0];
      }
    }
}

class TestSimpleBreakPoints {
  constructor() {
    var b1 = new SimpleBreakPoints([30, 400, 1500, 2000]);
    console.log(b1.firstBreakPoint() === 30);
    console.log(b1.lastBreakPoint() === 2000);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 30) === 400);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 400) === 1500);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 600) === 1500);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 400) === 30);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 1999) === 1500);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 2000) === 1500);
  }
}

// new TestSimpleBreakPoints();

}
}