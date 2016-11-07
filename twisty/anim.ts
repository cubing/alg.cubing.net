"use strict";

// The values are animation scaling factors.
enum AnimDirection {
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
type Duration = number; // Duration in milliseconds
type TimeStamp = Duration; // Duration since a particular epoch.

class AnimModel {
  private cursor: Duration = 0;
  private lastCursorTime: TimeStamp = 0;
  private direction: AnimDirection = AnimDirection.Paused;
  private breakPointType: BreakPointType = BreakPointType.EntireMoveSequence;
  private scheduler: FrameScheduler;
  private tempo: number = 1; // TODO: Support setting tempo.
  // TODO: cache breakpoints instead of re-querying the model constantly.
  constructor(private displayCallback: (Timestamp) => void, private breakPointModel: BreakPointModel) {
    this.scheduler = new FrameScheduler(this.frame.bind(this));
  }

  // Renders the current cursor.
  private display() {
    // TODO: AVoid rendering if the cursor hasn't moved since last time.
    this.displayCallback(this.cursor);
  }

  private timeScaling(): number {
    return this.direction * this.tempo;
  }

  // Update the cursor based on the time since lastCursorTime, and reset
  // lastCursorTime.
  private updateCursor(timeStamp: TimeStamp) {
    if (this.direction === AnimDirection.Paused) {
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

    var isForwards = (this.direction === AnimDirection.Forwards);
    var isPastBreakPoint = isForwards ?
      (this.cursor > breakPoint) :
      (this.cursor < breakPoint);
    if (isPastBreakPoint) {
        this.cursor = breakPoint;
        this.direction = AnimDirection.Paused;
        this.scheduler.stop();
    }
  }

  private frame(timeStamp: TimeStamp) {
    this.updateCursor(timeStamp);
    this.display();
  }

  // TODO: Push this into breakPointModel.
  setBreakPointType(breakPointType: BreakPointType) {
    this.breakPointType = breakPointType;
  }

  isPaused() {
    return this.direction === AnimDirection.Paused;
  }

  // Animate or pause in the given direction.
  // Idempotent.
  animateDirection(direction: AnimDirection): void {
    if (this.direction === direction) {
      return;
    }

    // Update cursor based on previous direction.
    this.updateCursor(performance.now());

    // Start the new direction.
    this.direction = direction;
    if (direction === AnimDirection.Paused) {
      this.scheduler.stop();
    } else {
      this.scheduler.start();
    }
  }

  // A simple wrapper for animateDirection(Paused).
  pause(): void {
    this.animateDirection(AnimDirection.Paused);
  }

  private skipAndPauseTo(duration: Duration): void {
    this.pause();
    this.cursor = duration;
    this.scheduler.singleFrame();
  }

  skipToStart(): void {
    this.skipAndPauseTo(this.breakPointModel.firstBreakPoint());
  }

  skipToEnd(): void {
    this.skipAndPauseTo(this.breakPointModel.lastBreakPoint());
  }
}

class AnimController {
  private model: AnimModel;

  // TODO: come up with a more elegant way to instantiate the model+controller.
  constructor(displayCallback: (Timestamp) => void, breakPointModel: BreakPointModel) {
    this.model = new AnimModel(displayCallback, breakPointModel);
  }

  playForward(): void {
    this.model.setBreakPointType(BreakPointType.EntireMoveSequence);
    this.model.animateDirection(AnimDirection.Forwards);
  }

  pause(): void {
    // Intentionally don't change breakPointType.
    this.model.animateDirection(AnimDirection.Paused);
  }

  playBackward(): void {
    this.model.setBreakPointType(BreakPointType.EntireMoveSequence);
    this.model.animateDirection(AnimDirection.Backwards);
  }

  skipToStart(): void {
    this.model.skipToStart();
  }

  skipToEnd(): void {
    this.model.skipToEnd();
  }

  stepForward(): void {
    this.model.setBreakPointType(BreakPointType.Move);
    this.model.animateDirection(AnimDirection.Forwards);
  }

  stepBackward(): void {
    this.model.setBreakPointType(BreakPointType.Move);
    this.model.animateDirection(AnimDirection.Backwards);
  }

  togglePausePlayForward(): void {
    if (this.model.isPaused()) {
      this.playForward();
    } else {
      this.pause();
    }
  }
}

class FrameScheduler {
  private animating: boolean = false;
  constructor(private callback: (TimeStamp) => void) {}

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
interface BreakPointModel {
  firstBreakPoint(): Duration;
  lastBreakPoint(): Duration;
  // TODO: Define semantics if `duration` is past the end.
  breakPoint(direction: AnimDirection, breakPointType: BreakPointType, duration: Duration): Duration;
}

class SimpleBreakPoints implements BreakPointModel {
    // Assumes breakPointList is sorted.
    constructor(private breakPointList: Duration[]) {}

    firstBreakPoint() {
      return this.breakPointList[0];
    }
    lastBreakPoint() {
      return this.breakPointList[this.breakPointList.length - 1];
    }

    breakPoint(direction: AnimDirection, breakPointType: BreakPointType, duration: Duration) {
      if (direction === AnimDirection.Backwards) {
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
    console.log(b1.breakPoint(AnimDirection.Forwards, BreakPointType.Move, 30) === 400);
    console.log(b1.breakPoint(AnimDirection.Forwards, BreakPointType.Move, 400) === 1500);
    console.log(b1.breakPoint(AnimDirection.Forwards, BreakPointType.Move, 600) === 1500);
    console.log(b1.breakPoint(AnimDirection.Backwards, BreakPointType.Move, 400) === 30);
    console.log(b1.breakPoint(AnimDirection.Backwards, BreakPointType.Move, 1999) === 1500);
    console.log(b1.breakPoint(AnimDirection.Backwards, BreakPointType.Move, 2000) === 1500);
  }
}

// new TestSimpleBreakPoints();