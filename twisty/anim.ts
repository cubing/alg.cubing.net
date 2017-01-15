"use strict";

namespace Twisty {
export namespace Anim {

export interface CursorObserver {
  animCursorChanged: (cursor: Timeline.Duration) => void;
}

export interface DirectionObserver {
  animDirectionChanged: (direction: Timeline.Direction) => void;
}

// export interface BoundsObserver {
//   animBoundsChanged: (start: Timeline.Duration, end: Timeline.Duration) => void;
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

  animCursorChanged(cursor: Timeline.Duration) {
    // TODO: guard against nested changes and test.
    for (var observer of this.cursorObservers) {
      observer.animCursorChanged(cursor);
    }
  }

  animDirectionChanged(direction: Timeline.Direction) {
    // TODO: guard against nested changes and test.
    for (var observer of this.directionObservers) {
      observer.animDirectionChanged(direction);
    }
  }
}

export class Model {
  private cursor: Timeline.Duration = 0;
  private lastCursorTime: Timeline.TimeStamp = 0;
  private direction: Timeline.Direction = Timeline.Direction.Paused;
  private breakPointType: Timeline.BreakPointType = Timeline.BreakPointType.EntireMoveSequence;
  private scheduler: FrameScheduler;
  private tempo: number = 1.5; // TODO: Support setting tempo.
  public dispatcher: Dispatcher = new Dispatcher();
  // TODO: cache breakpoints instead of re-querying the model constantly.
  constructor(public timeline: Timeline) {
    this.scheduler = new FrameScheduler(this.frame.bind(this));
  }

  public getCursor(): Timeline.Duration {
    return this.cursor;
  }

  public getBounds(): Timeline.Duration[] {
    return [
      this.timeline.firstBreakPoint(),
      this.timeline.lastBreakPoint()
    ];
  }

  private timeScaling(): number {
    return this.direction * this.tempo;
  }

  // Update the cursor based on the time since lastCursorTime, and reset
  // lastCursorTime.
  private updateCursor(timeStamp: Timeline.TimeStamp) {
    if (this.direction === Timeline.Direction.Paused) {
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
    var breakPoint = this.timeline.breakPoint(this.direction, this.breakPointType, previousCursor);

    var isForwards = (this.direction === Timeline.Direction.Forwards);
    var isPastBreakPoint = isForwards ?
      (this.cursor > breakPoint) :
      (this.cursor < breakPoint);
    if (isPastBreakPoint) {
        this.cursor = breakPoint;
        this.setDirection(Timeline.Direction.Paused);
        this.scheduler.stop();
    }
  }

  private setDirection(direction: Timeline.Direction) {
    // TODO: Handle in frame for debouncing?
    // (Are there any use cases that need synchoronous observation?)
    this.direction = direction;
    this.dispatcher.animDirectionChanged(direction);
  }

  private frame(timeStamp: Timeline.TimeStamp) {
    this.updateCursor(timeStamp);
    this.dispatcher.animCursorChanged(this.cursor);
  }

  // TODO: Push this into timeline.
  private setBreakPointType(breakPointType: Timeline.BreakPointType) {
    this.breakPointType = breakPointType;
  }

  private isPaused() {
    return this.direction === Timeline.Direction.Paused;
  }

  // Animate or pause in the given direction.
  // Idempotent.
  private animateDirection(direction: Timeline.Direction): void {
    if (this.direction === direction) {
      return;
    }

    // Update cursor based on previous direction.
    this.updateCursor(performance.now());

    // Start the new direction.
    this.setDirection(direction);
    if (direction === Timeline.Direction.Paused) {
      this.scheduler.stop();
    } else {
      this.scheduler.start();
    }
  }

  public skipAndPauseTo(duration: Timeline.Duration): void {
    this.pause();
    this.cursor = duration;
    this.scheduler.singleFrame();
  }

  playForward(): void {
    this.setBreakPointType(Timeline.BreakPointType.EntireMoveSequence);
    this.animateDirection(Timeline.Direction.Forwards);
  }

  // A simple wrapper for animateDirection(Paused).
  pause(): void {
    this.animateDirection(Timeline.Direction.Paused);
  }

  playBackward(): void {
    this.setBreakPointType(Timeline.BreakPointType.EntireMoveSequence);
    this.animateDirection(Timeline.Direction.Backwards);
  }

  skipToStart(): void {
    this.skipAndPauseTo(this.timeline.firstBreakPoint());
  }

  skipToEnd(): void {
    this.skipAndPauseTo(this.timeline.lastBreakPoint());
  }

  stepForward(): void {
    this.setBreakPointType(Timeline.BreakPointType.Move);
    this.animateDirection(Timeline.Direction.Forwards);
  }

  stepBackward(): void {
    this.setBreakPointType(Timeline.BreakPointType.Move);
    this.animateDirection(Timeline.Direction.Backwards);
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
  constructor(private callback: (timeStamp: Timeline.TimeStamp) => void) {}

  animFrame(timeStamp: Timeline.TimeStamp) {
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

}
}