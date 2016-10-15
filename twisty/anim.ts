"use strict";

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
  constructor(private displayCallback: (Timestamp) => void) {}

  /* display */

  // Renders the current cursor.
  private display() {
    this.displayCallback(this.cursor);
  }

  /* animFrame */

  private frame(timeStamp: TimeStamp) {
    this.cursor += timeStamp - this.lastFrameTime;
    this.lastFrameTime = timeStamp;
    this.display();
  }
  private animFrame(timeStamp: TimeStamp) {
    this.frame(timeStamp);
    if (this.state !== TwistyAnimState.Paused) {
      this.requestAnimFrame();
    }
  }
  private requestAnimFrame() {
    this.requestID = requestAnimationFrame(this.animFrame.bind(this));
  }
  private cancelAnimFrame() {
    cancelAnimationFrame(this.requestID);
    this.requestID = ANIM_REQUEST_PAUSED;
  }
  private isAnimating() {
    return this.requestID !== ANIM_REQUEST_PAUSED;
  }
  // Starts animating iff not already animating.
  private animate() {
    if (this.isAnimating()) {
      return;
    }
    this.lastFrameTime = performance.now();
    this.requestAnimFrame();
  }
  // Effectively performs an immediate animFrame, and then stops animating.
  // The cursor may stop partway through a move.
  pauseInterpolated() {
    this.cancelAnimFrame();
    this.state = TwistyAnimState.Paused;
    this.frame(performance.now());
  }
  reset() {
    this.cancelAnimFrame();
    this.state = TwistyAnimState.Paused;
    this.cursor = 0;
    this.display();
  }

  /* Controls */

  private switchAnim(state: TwistyAnimState) {
    if (this.state === state) {
      return;
    }
    if (this.isAnimating()) {
      this.pauseInterpolated();
    }
    this.state = state;
    this.animate();
  }

  playForward() {
    this.switchAnim(TwistyAnimState.PlayForward);
  }

  playPause() {
    if (this.isAnimating()) {
      this.pauseInterpolated();
    } else {
      this.playForward();
    }
  }
}
