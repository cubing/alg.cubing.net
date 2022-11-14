"use strict";
var TwistyAnimState;
(function (TwistyAnimState) {
    TwistyAnimState[TwistyAnimState["Paused"] = 0] = "Paused";
    TwistyAnimState[TwistyAnimState["StepForward"] = 1] = "StepForward";
    TwistyAnimState[TwistyAnimState["PlayForward"] = 2] = "PlayForward";
    TwistyAnimState[TwistyAnimState["StepBackward"] = 3] = "StepBackward";
    TwistyAnimState[TwistyAnimState["PlayBackward"] = 4] = "PlayBackward";
})(TwistyAnimState || (TwistyAnimState = {}));
// 0 cannot represent an active request ID:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
var ANIM_REQUEST_PAUSED = 0;
var TwistyAnim = (function () {
    // TODO: speed
    function TwistyAnim(displayCallback) {
        this.displayCallback = displayCallback;
        this.cursor = 0;
        this.lastFrameTime = 0;
        this.state = TwistyAnimState.Paused;
        this.requestID = ANIM_REQUEST_PAUSED;
    }
    /* display */
    // Renders the current cursor.
    TwistyAnim.prototype.display = function () {
        this.displayCallback(this.cursor);
    };
    /* animFrame */
    TwistyAnim.prototype.frame = function (timeStamp) {
        this.cursor += timeStamp - this.lastFrameTime;
        this.lastFrameTime = timeStamp;
        this.display();
    };
    TwistyAnim.prototype.animFrame = function (timeStamp) {
        this.frame(timeStamp);
        if (this.state !== TwistyAnimState.Paused) {
            this.requestAnimFrame();
        }
    };
    TwistyAnim.prototype.requestAnimFrame = function () {
        this.requestID = requestAnimationFrame(this.animFrame.bind(this));
    };
    TwistyAnim.prototype.cancelAnimFrame = function () {
        cancelAnimationFrame(this.requestID);
        this.requestID = ANIM_REQUEST_PAUSED;
    };
    TwistyAnim.prototype.isAnimating = function () {
        return this.requestID !== ANIM_REQUEST_PAUSED;
    };
    // Starts animating iff not already animating.
    TwistyAnim.prototype.animate = function () {
        if (this.isAnimating()) {
            return;
        }
        this.lastFrameTime = performance.now();
        this.requestAnimFrame();
    };
    // Pauses wheverver the cursoer is, even if it's partway through a move.
    TwistyAnim.prototype.pauseInterpolated = function () {
        this.cancelAnimFrame();
        this.state = TwistyAnimState.Paused;
        this.frame(performance.now());
    };
    TwistyAnim.prototype.reset = function () {
        this.cancelAnimFrame();
        this.state = TwistyAnimState.Paused;
        this.cursor = 0;
        this.display();
    };
    /* Controls */
    TwistyAnim.prototype.switchAnim = function (state) {
        if (this.state === state) {
            return;
        }
        if (this.isAnimating()) {
            this.pauseInterpolated();
        }
        this.state = state;
        this.animate();
    };
    TwistyAnim.prototype.playForward = function () {
        this.switchAnim(TwistyAnimState.PlayForward);
    };
    TwistyAnim.prototype.playPause = function () {
        if (this.isAnimating()) {
            this.pauseInterpolated();
        }
        else {
            this.playForward();
        }
    };
    return TwistyAnim;
}());
//# sourceMappingURL=anim.js.map