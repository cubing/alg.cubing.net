"use strict";

// TODO: learn how to use modules

class TwistyPlayer {
  private readonly viewContainer: HTMLElement;
  private anim: AnimController;
  private controlBar: TwistyControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.anim = new AnimController(this.draw.bind(this), new SimpleBreakPoints([0, 1000, 1500, 2500]));
    this.controlBar = new TwistyControlBar(this.anim);

    this.element.appendChild(this.viewContainer);
    this.element.appendChild(this.controlBar.element);

    this.draw(0);
  }

  draw(duration: Duration) {
    this.viewContainer.textContent = String(Math.floor(duration));
  }

  // Initialize a Twisty for the given Element unless the element's
  // `initialization` attribute is set to `custom`.
  private static autoInitialize(elem: Element) {
    const ini = elem.getAttribute("initialization");
    if (ini !== "custom") {
      new TwistyPlayer(elem);
    }
  }

  static autoInitializePage() {
    const elems = document.querySelectorAll("twisty");
    console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

    for (let i = 0; i < elems.length; i++) {
      TwistyPlayer.autoInitialize(elems[i]);
    }
  }
}

class TwistyControlBar {
  public element;
  constructor(public anim: AnimController) {
    this.element = document.createElement("twisty-control-bar");

    // TODO: Use SVGs or a web font for element-relative sizing.
    const buttons = [{
        title: "Cycle display mode",
        iconClass: "fullscreen",
        fn: () => {}
      }, {
        title: "Skip to start",
        iconClass: "skip-to-start",
        fn: anim.skipToStart.bind(anim)
      }, {
        title: "Step back",
        iconClass: "step-backward",
        fn: anim.stepBackward.bind(anim)
      }, {
        title: "Play",
        iconClass: "play",
        fn: anim.togglePausePlayForward.bind(anim) // TODO: Toggle between play and pause icon.
      }, {
        title: "Step forward",
        iconClass: "step-forward",
        fn: anim.stepForward.bind(anim)
      }, {
        title: "Skip to end",
        iconClass: "skip-to-end",
        fn: anim.skipToEnd.bind(anim)
      }];

    for (let i = 0; i < 6; i++) {
      const button = document.createElement("button");
      button.title = buttons[i].title;
      // TODO: Handle updating image based on anim state.
      button.classList.add(buttons[i].iconClass);
      button.addEventListener("click", buttons[i].fn);
      this.element.appendChild(button);
    }
  }
}

window.addEventListener("load", TwistyPlayer.autoInitializePage);
