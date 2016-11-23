"use strict";

// TODO: learn how to use modules

interface Document {
    mozCancelFullScreen: () => void;
    msExitFullscreen: () => void;
}

interface Element {
    mozRequestFullScreen: () => void;
    msRequestFullscreen: () => void;
}

class TwistyPlayer {
  private readonly viewContainer: HTMLElement;
  private anim: AnimController;
  private controlBar: TwistyControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.anim = new AnimController(this.draw.bind(this), new SimpleBreakPoints([0, 1000, 1500, 2500]));
    this.controlBar = new TwistyControlBar(this.anim, this.element);

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

window.addEventListener("load", TwistyPlayer.autoInitializePage);
