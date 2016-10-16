"use strict";

// TODO: Split up direction from animation type (paused, step, move, etc.)
enum TwistyAnimState {
  Paused,
  StepForward,
  PlayForward,
  StepBackward,
  PlayBackward
}

type Duration = number; // Duration in milliseconds
type TimeStamp = Duration; // Duration since a particular epoch.

// 0 cannot represent an active request ID:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
var ANIM_REQUEST_PAUSED = 0;

class TwistyAnim {
  private cursor: Duration = 0;
  private lastFrameTime: TimeStamp = 0;
  private state: TwistyAnimState = TwistyAnimState.Paused;
  private requestID: number = ANIM_REQUEST_PAUSED;
  // TODO: speed
  // TODO: cache breakpoints instead of re-querying the model constantly.
  constructor(private displayCallback: (Timestamp) => void, private breakPointModel: BreakPointModel) {}

  /* display */

  // Renders the current cursor.
  private display() {
    this.displayCallback(this.cursor);
  }

  /* animFrame */

  private static isBackwardState(state: TwistyAnimState): boolean {
    return state === TwistyAnimState.PlayBackward || state === TwistyAnimState.StepBackward;
  }

  private static isStepState(state: TwistyAnimState): boolean {
    return state === TwistyAnimState.StepBackward || state === TwistyAnimState.StepForward;
  }

  private haveReachedBreakPoint(duration: Duration): boolean {
    if (TwistyAnim.isBackwardState(this.state)) {
      return this.breakPointModel.backwardBreakPoint(this.cursor) >= duration;
    } else {
      return this.breakPointModel.forwardBreakPoint(this.cursor) <= duration;
    }
  }

  private frame(timeStamp: TimeStamp): void {
    var dirMultiplier = (TwistyAnim.isBackwardState(this.state) ? -1 : 1);
    var newCursor = this.cursor + dirMultiplier * (timeStamp - this.lastFrameTime);
    console.log(newCursor, this.cursor, this.lastFrameTime, timeStamp);
    // TODO: calculate actual boundaries.
    if (TwistyAnim.isStepState(this.state) && this.haveReachedBreakPoint(newCursor)) {
      // TODO: Combine directional logic with haveReachedBreakPoint();
      this.cursor = TwistyAnim.isBackwardState(this.state) ? this.breakPointModel.backwardBreakPoint(this.cursor) : this.breakPointModel.forwardBreakPoint(this.cursor);
      this.state = TwistyAnimState.Paused;
      this.requestID = ANIM_REQUEST_PAUSED;
    } else {
      this.cursor = newCursor;
    }
    this.lastFrameTime = timeStamp;
    this.display();
  }
  private animFrame(timeStamp: TimeStamp): void {
    this.frame(timeStamp);
    if (this.state !== TwistyAnimState.Paused) {
      this.requestAnimFrame();
    }
  }
  private requestAnimFrame(): void {
    this.requestID = requestAnimationFrame(this.animFrame.bind(this));
  }
  private cancelAnimFrame(): void {
    cancelAnimationFrame(this.requestID);
    this.requestID = ANIM_REQUEST_PAUSED;
  }
  private isAnimating(): boolean {
    return this.requestID !== ANIM_REQUEST_PAUSED;
  }
  // Starts animating iff not already animating.
  private animate(): void {
    if (this.isAnimating()) {
      return;
    }
    this.lastFrameTime = performance.now();
    this.requestAnimFrame();
  }
  // Effectively performs an immediate animFrame, and then stops animating.
  // The cursor may stop partway through a move.
  pauseInterpolated(): void {
    if (!this.isAnimating()) {
      return;
    }
    this.cancelAnimFrame();
    this.state = TwistyAnimState.Paused;
    this.frame(performance.now()); // TODO: Schedule a frame instead, in case of many pause callse?
  }
  private skipAndPauseTo(duration: Duration): void {
    this.cancelAnimFrame();
    this.state = TwistyAnimState.Paused;
    this.cursor = duration;
    this.display(); // TODO: Schedule a frame instead, in case of many pause callse?
  }

  /* Controls */

  private switchAnim(state: TwistyAnimState): void {
    console.log("switch");
    if (this.state === state) {
      return;
    }
    if (this.isAnimating()) {
      this.pauseInterpolated();
    }
    this.state = state;
    this.animate();
  }

  skipToStart(): void {
    this.skipAndPauseTo(this.breakPointModel.firstBreakPoint());
  }

  skipToEnd(): void {
    this.skipAndPauseTo(this.breakPointModel.lastBreakPoint());
  }

  playForward(): void {
    this.switchAnim(TwistyAnimState.PlayForward);
  }

  stepForward(): void {
    this.switchAnim(TwistyAnimState.StepForward);
  }

  playBackward(): void {
    this.switchAnim(TwistyAnimState.PlayBackward);
  }

  stepBackward(): void {
    this.switchAnim(TwistyAnimState.StepBackward);
  }

  playPause(): void {
    if (this.isAnimating()) {
      this.pauseInterpolated();
    } else {
      this.playForward();
    }
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
  forwardBreakPoint(duration: Duration): Duration;
  backwardBreakPoint(duration: Duration): Duration;
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
    forwardBreakPoint(duration: Duration) {
      return this.breakPointList.filter(d2 => d2 > duration)[0];
    }
    backwardBreakPoint(duration: Duration) {
      var l = this.breakPointList.filter(d2 => d2 < duration);
      return l[l.length - 1];
    }
}

class TestSimpleBreakPoints {
  constructor() {
    var b1 = new SimpleBreakPoints([30, 400, 1500, 2000]);
    console.log(b1.firstBreakPoint() === 30);
    console.log(b1.lastBreakPoint() === 2000);
    console.log(b1.forwardBreakPoint(30) === 400);
    console.log(b1.forwardBreakPoint(400) === 1500);
    console.log(b1.forwardBreakPoint(600) === 1500);
    console.log(b1.backwardBreakPoint(400) === 30);
    console.log(b1.backwardBreakPoint(1999) === 1500);
    console.log(b1.backwardBreakPoint(2000) === 1500);
  }
}

new TestSimpleBreakPoints();