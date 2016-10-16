"use strict";

// TODO: learn how to use modules

class TwistyPlayer {
  private readonly viewContainer: HTMLElement;
  private anim: TwistyAnim;
  private controlBar: TwistyControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.anim = new TwistyAnim(this.draw.bind(this), new SimpleBreakPoints([0, 1000, 1500, 2500]));
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
  constructor(public anim: TwistyAnim) {
    this.element = document.createElement("twisty-control-bar");

    // TODO: Use SVGs or a web font for element-relative sizing.
    const buttons = [{
        title: "Cycle display mode",
        icon: "\u2934\uFE0F",
        fn: () => {}
      }, {
        title: "Skip to start",
        icon: "\u23EE",
        fn: anim.skipToStart.bind(anim)
      }, {
        title: "Step back",
        icon: "\u2B05\uFE0F",
        fn: anim.stepBackward.bind(anim)
      }, {
        title: "Play",
        icon: "\u23EF",
        fn: anim.playPause.bind(anim) // TODO: Toggle between play and pause icon.
      }, {
        title: "Step forward",
        icon: "\u27A1\uFE0F",
        fn: anim.stepForward.bind(anim)
      }, {
        title: "Skip to end",
        icon: "\u23ED",
        fn: anim.skipToEnd.bind(anim)
      }];

    for (let i = 0; i < 6; i++) {
      const button = document.createElement("button");
      button.title = buttons[i].title;
      button.textContent = buttons[i].icon;
      this.element.appendChild(button);
      button.addEventListener("click", buttons[i].fn);
    }
  }
}

window.addEventListener("load", TwistyPlayer.autoInitializePage);
