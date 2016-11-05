"use strict";

// The values are scaling factors.
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

// 0 cannot represent an active request ID:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
var ANIM_REQUEST_PAUSED = 0;

// TODO: Break into model (≈instance variables, private methods) and controller?
class TwistyAnim {
  private cursor: Duration = 0;
  private lastFrameTime: TimeStamp = 0;
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
    this.displayCallback(this.cursor);
  }

  private timeScaling(): number {
    // Since we don't have a tunable tempo, we directly use the direction
    // scaling factor.
    return this.direction * this.tempo;
  }

  // Update the cursor based on the time since lastFrameTime, and reset
  // lastFrameTime.
  private updateCursor(timeStamp: TimeStamp) {
    if (this.direction === AnimDirection.Paused) {
      this.lastFrameTime = timeStamp;
      return;
    }

    var previousCursor = this.cursor;

    var elapsed = timeStamp - this.lastFrameTime;
    // Workaround for the first frame: https://twitter.com/lgarron/status/794846097445269504
    if (elapsed < 0) {
      elapsed = 0;
    }
    this.cursor += elapsed * this.timeScaling();
    this.lastFrameTime = timeStamp;

    // Check if we've passed a breakpoint
    // TODO: check if we've gone off the end.
    var isForwards = (this.direction === AnimDirection.Forwards);
    var nextBreakPoint = isForwards ?
      this.breakPointModel.forwardsBreakPoint(previousCursor) :
      this.breakPointModel.backwardsBreakPoint(previousCursor);
    var isPastBreakPoint = isForwards ?
      (this.cursor > nextBreakPoint) :
      (this.cursor < nextBreakPoint);
    if (isPastBreakPoint) {
        this.cursor = nextBreakPoint;
        this.direction = AnimDirection.Paused;
        this.scheduler.stop();
    }
  }

  private frame(timeStamp: TimeStamp) {
    this.updateCursor(timeStamp);
    this.display();
  }

  // Animate or pause in the given direction.
  // Idempotent.
  private animateDirection(direction: AnimDirection): void {
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

  private skipAndPauseTo(duration: Duration): void {
    this.pause();
    this.cursor = duration;
    this.scheduler.singleFrame();
  }

  /* Controls */

  playForward(): void {
    this.breakPointType = BreakPointType.EntireMoveSequence;
    this.animateDirection(AnimDirection.Forwards);
  }

  pause(): void {
    // Intentionally don't change breakPointType.
    this.animateDirection(AnimDirection.Paused);
  }

  playBackward(): void {
    this.breakPointType = BreakPointType.EntireMoveSequence;
    this.animateDirection(AnimDirection.Backwards);
  }

  skipToStart(): void {
    this.skipAndPauseTo(this.breakPointModel.firstBreakPoint());
  }

  skipToEnd(): void {
    this.skipAndPauseTo(this.breakPointModel.lastBreakPoint());
  }

  stepForward(): void {
    this.breakPointType = BreakPointType.Move;
    this.animateDirection(AnimDirection.Forwards);
  }

  stepBackward(): void {
    this.breakPointType = BreakPointType.Move;
    this.animateDirection(AnimDirection.Backwards);
  }

  togglePausePlayForward(): void {
    if (this.direction === AnimDirection.Paused) {
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
  forwardsBreakPoint(duration: Duration): Duration;
  backwardsBreakPoint(duration: Duration): Duration;
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
    forwardsBreakPoint(duration: Duration) {
      return this.breakPointList.filter(d2 => d2 > duration)[0];
    }
    backwardsBreakPoint(duration: Duration) {
      var l = this.breakPointList.filter(d2 => d2 < duration);
      return l[l.length - 1];
    }
}

class TestSimpleBreakPoints {
  constructor() {
    var b1 = new SimpleBreakPoints([30, 400, 1500, 2000]);
    console.log(b1.firstBreakPoint() === 30);
    console.log(b1.lastBreakPoint() === 2000);
    console.log(b1.forwardsBreakPoint(30) === 400);
    console.log(b1.forwardsBreakPoint(400) === 1500);
    console.log(b1.forwardsBreakPoint(600) === 1500);
    console.log(b1.backwardsBreakPoint(400) === 30);
    console.log(b1.backwardsBreakPoint(1999) === 1500);
    console.log(b1.backwardsBreakPoint(2000) === 1500);
  }
}

// new TestSimpleBreakPoints();