"use strict";

interface Document {
    mozCancelFullScreen: () => void;
    msExitFullscreen: () => void;
    mozFullScreenElement: Element
    msFullscreenElement: Element
}

interface Element {
    mozRequestFullScreen: () => void;
    msRequestFullscreen: () => void;
}

namespace FullscreenAPI {
  export function element() {
    return document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ||
           document.msFullscreenElement ||
           document.webkitFullscreenElement;
  }
  export function request(element: Element) {
    var requestFullscreen = element.requestFullscreen ||
                            element.mozRequestFullScreen ||
                            element.msRequestFullscreen ||
                            element.webkitRequestFullscreen;
    requestFullscreen.call(element);
  }
  export function exit() {
    var exitFullscreen = document.exitFullscreen ||
                         document.mozCancelFullScreen ||
                         document.msExitFullscreen ||
                         document.webkitExitFullscreen;
    exitFullscreen.call(document);
  }
}

namespace Twisty {
export namespace Widget {

export abstract class Button {
  public element: HTMLButtonElement;
  constructor(title: string, initialClass: string) {
    this.element = document.createElement("button");
    this.element.title = title;
    // TODO: Handle updating image based on anim state.
    this.element.classList.add(initialClass);
    this.element.addEventListener("click", this.onpress.bind(this));
  }

  abstract onpress(): void
}

export module Button {

  export class Fullscreen extends Button {
    constructor(private fullscreenElement: Element) {
      super("Full Screen", "fullscreen");
    }

    onpress(): void {
      if (FullscreenAPI.element() === this.fullscreenElement) {
        FullscreenAPI.exit();
      } else {
        FullscreenAPI.request(this.fullscreenElement);
      }
    }
  }

  export class SkipToStart extends Button {
    constructor(private anim: Anim.Model) {
      super("Skip To Start", "skip-to-start"); }
    onpress(): void { this.anim.skipToStart(); }
  }
  export class SkipToEnd extends Button {
    constructor(private anim: Anim.Model) {
      super("Skip To End", "skip-to-end"); }
    onpress(): void { this.anim.skipToEnd(); }
  }
  export class PlayPause extends Button implements Anim.DirectionObserver {
    constructor(private anim: Anim.Model) {
      super("Play", "play");
      this.anim.dispatcher.registerDirectionObserver(this);
    }
    onpress(): void { this.anim.togglePausePlayForward(); }
    animDirectionChanged(direction: Cursor.Direction): void {
      // TODO: Handle flash of pause button when pressed while the Twisty is already at the end.
      var newClass = direction === Cursor.Direction.Paused ? "play" : "pause";
      this.element.classList.remove("play", "pause")
      this.element.classList.add(newClass);

      this.element.title = direction === Cursor.Direction.Paused ? "Play" : "Pause";
    }
  }
  export class StepForward extends Button {
    constructor(private anim: Anim.Model) {
      super("Step forward", "step-forward"); }
    onpress(): void { this.anim.stepForward(); }
  }
  export class StepBackward extends Button {
    constructor(private anim: Anim.Model) {
      super("Step backward", "step-backward"); }
    onpress(): void { this.anim.stepBackward(); }
  }
}

export class ControlBar {
  public element: HTMLElement;
  constructor(private anim: Anim.Model, private twistyElement: Element) {
    this.element = document.createElement("twisty-control-bar");

    this.element.appendChild((new Button.Fullscreen(twistyElement)).element);
    this.element.appendChild((new Button.SkipToStart(anim)).element);
    this.element.appendChild((new Button.StepBackward(anim)).element);
    this.element.appendChild((new Button.PlayPause(anim)).element);
    this.element.appendChild((new Button.StepForward(anim)).element);
    this.element.appendChild((new Button.SkipToEnd(anim)).element);
  }
}

export class Scrubber implements Anim.CursorObserver {
  public readonly element: HTMLInputElement;
  constructor(private anim: Anim.Model) {
    this.element = document.createElement("input");
    this.element.classList.add("scrubber");
    this.element.type = "range";

    this.element.addEventListener("input", this.oninput.bind(this));
    var bounds = this.anim.getBounds();
    this.element.min = String(bounds[0]);
    this.element.max = String(bounds[1]);
    this.element.value = String(this.anim.cursor.currentTimestamp());
    this.anim.dispatcher.registerCursorObserver(this);
  }

  private updateBackground() {
    // TODO: Figure out the most efficient way to do this.
    // TODO: Pad by the thumb radius at each end.
    var min = parseInt(this.element.min);
    var max = parseInt(this.element.max);
    var value = parseInt(this.element.value);
    var v = (value - min) / max * 100;
    this.element.style.background = `linear-gradient(to right, \
      rgb(204, 24, 30) 0%, \
      rgb(204, 24, 30) ${v}%, \
      rgba(0, 0, 0, 0.25) ${v}%, \
      rgba(0, 0, 0, 0.25) 100%\
      )`;
  }

  private oninput(): void {
    // TODO: Ideally, we should prevent this from firing back.
    this.anim.skipAndPauseTo(parseInt(this.element.value));
    this.updateBackground();
  }

  animCursorChanged(cursor: Cursor<Puzzle>): void {
    this.element.value = String(cursor.currentTimestamp());
    this.updateBackground();
  }

  animBoundsChanged(): void {
    // TODO
    this.updateBackground();
  }
}

export class CursorTextView implements Anim.CursorObserver {
  public readonly element: Element;
  constructor(private anim: Anim.Model) {
    this.element = document.createElement("cursor-text-view");
    this.element.textContent = String(this.anim.cursor.currentTimestamp());
    this.anim.dispatcher.registerCursorObserver(this);
  }

  animCursorChanged(cursor: Cursor<Puzzle>) {
    this.element.textContent = String(Math.floor(cursor.currentTimestamp()));
  }
}

export class CursorTextMoveView implements Anim.CursorObserver {
  public readonly element: Element;
  constructor(private anim: Anim.Model) {
    this.element = document.createElement("cursor-text-view");
    this.anim.dispatcher.registerCursorObserver(this);

    var durFn = new Cursor.AlgDuration(Cursor.DefaultDurationForAmount);

    this.animCursorChanged(anim.cursor);
  }

  private formatFraction(k: number) {
    return (String(k) + (Math.floor(k) === k ? "." : "") + "000000").slice(0, 5)
  }

  animCursorChanged(cursor: Cursor<Puzzle>) {
    var pos = cursor.currentPosition();
    var s = "" + Math.floor(cursor.currentTimestamp());
    if (pos.moves.length > 0) {
      s += " " + pos.moves[0].move.toString() + " " + this.formatFraction(pos.moves[0].fraction);
    }
    this.element.textContent = s;
  }
}

export class KSolveView implements Anim.CursorObserver {
  public readonly element: Element;
  private svg: KSolve.SVG;
  constructor(private anim: Anim.Model, private definition: KSolve.PuzzleDefinition) {
    this.element = document.createElement("ksolve-svg-view");
    this.anim.dispatcher.registerCursorObserver(this);

    this.svg = new KSolve.SVG(definition); // TODO: Dynamic puzzle
    this.element.appendChild(this.svg.element);
  }

  animCursorChanged(cursor: Cursor<Puzzle>) {
    var pos = cursor.currentPosition();
    if (pos.moves.length > 0) {

      var move = (pos.moves[0].move as Alg.BlockMove);

      var def = this.definition;
      var newState = KSolve.Combine(
        def,
        pos.state as KSolve.Transformation,
        KSolve.Multiply(def, def.moves[move.base], move.amount * pos.moves[0].direction)
      );
      this.svg.draw(this.definition, pos.state as KSolve.Transformation, newState, pos.moves[0].fraction);
    } else {
      this.svg.draw(this.definition, pos.state as KSolve.Transformation);
    }
  }
}

export class Player {
  public element: Element;
  constructor(private anim: Anim.Model, definition: KSolve.PuzzleDefinition) {
    this.element = document.createElement("player");

    this.element.appendChild((new KSolveView(this.anim, definition)).element);
    this.element.appendChild((new Scrubber(this.anim)).element);
    this.element.appendChild((new ControlBar(this.anim, this.element)).element);
    this.element.appendChild((new CursorTextMoveView(this.anim)).element);
  }
}

}
}
