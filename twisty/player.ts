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

namespace Twisty {

export class Player {
  private readonly viewContainer: HTMLElement;
  private anim: AnimController;
  private scrubber: Twisty.Widget.Scrubber
  private controlBar: Twisty.Widget.ControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.anim = new AnimController(this.draw.bind(this), new SimpleBreakPoints([0, 1000, 1500, 2500]));
    this.scrubber = new Twisty.Widget.Scrubber(this.anim);
    this.controlBar = new Twisty.Widget.ControlBar(this.anim, this.element);

    this.element.appendChild(this.viewContainer);
    this.element.appendChild(this.scrubber.element);
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
      new Twisty.Player(elem);
    }
  }

  static autoInitializePage() {
    const elems = document.querySelectorAll("twisty");
    console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

    for (let i = 0; i < elems.length; i++) {
      Twisty.Player.autoInitialize(elems[i]);
    }
  }
}

window.addEventListener("load", Twisty.Player.autoInitializePage);

}