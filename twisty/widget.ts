"use strict";

namespace Twisty {
export namespace Widget {

export class ControlBar {
  private isFullscreen: boolean = false;
  private buttonElems: {[key: string]:Element}; // TODO: Use ES6 Map.
  public element: HTMLElement;
  constructor(private anim: AnimController, private twistyElement: Element) {
    this.element = document.createElement("twisty-control-bar");

    // TODO: Use SVGs or a web font for element-relative sizing.
    const buttons = [{
        title: "Cycle display mode",
        id: "fullscreen",
        initialClass: "fullscreen",
        fn: this.toggleFullscreen.bind(this)
      }, {
        title: "Skip to start",
        id: "skip-to-start",
        initialClass: "skip-to-start",
        fn: anim.skipToStart.bind(anim)
      }, {
        title: "Step back",
        id: "step-backward",
        initialClass: "step-backward",
        fn: anim.stepBackward.bind(anim)
      }, {
        title: "Play",
        id: "play",
        initialClass: "play",
        fn: anim.togglePausePlayForward.bind(anim) // TODO: Toggle between play and pause icon.
      }, {
        title: "Step forward",
        id: "step-forward",
        initialClass: "step-forward",
        fn: anim.stepForward.bind(anim)
      }, {
        title: "Skip to end",
        id: "skip-to-end",
        initialClass: "skip-to-end",
        fn: anim.skipToEnd.bind(anim)
      }];

    this.buttonElems = {};

    for (let i = 0; i < buttons.length; i++) {
      const button = document.createElement("button");
      button.title = buttons[i].title;
      // TODO: Handle updating image based on anim state.
      button.classList.add(buttons[i].initialClass);
      button.addEventListener("click", buttons[i].fn);

      this.buttonElems[buttons[i].id] = button;
      this.element.appendChild(button);
    }
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      var exitFullscreen = document.exitFullscreen ||
                           document.mozCancelFullScreen ||
                           document.msExitFullscreen ||
                           document.webkitExitFullscreen;
      exitFullscreen.call(document);
    } else {
      var requestFullscreen = this.twistyElement.requestFullscreen ||
                              this.twistyElement.mozRequestFullScreen ||
                              this.twistyElement.msRequestFullscreen ||
                              this.twistyElement.webkitRequestFullscreen;
      requestFullscreen.call(this.twistyElement);
    }
    this.isFullscreen = !this.isFullscreen;
  }
}

export class Scrubber implements AnimModelObserver {
  public readonly element: HTMLInputElement;
  constructor(private anim: AnimController) {
    this.element = document.createElement("input");
    this.element.classList.add("scrubber");
    this.element.type = "range";

    this.element.addEventListener("input", this.oninput.bind(this));
    var bounds = this.anim.model.getBounds();
    this.element.min = String(bounds[0]);
    this.element.max = String(bounds[1]);
    this.element.value = String(this.anim.model.getCursor());
    this.anim.model.addObserver(this);
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
    this.anim.model.skipAndPauseTo(parseInt(this.element.value));
    this.updateBackground();
  }

  animCursorChanged(): void {
    this.element.value = String(this.anim.model.getCursor());
    this.updateBackground();
  }

  animBoundsChanged(): void {
    // TODO
    this.updateBackground();
  }
}

}
}