"use strict";

// TODO: learn how to use modules

class TwistyPlayer {
  private readonly viewContainer: HTMLElement;
  private readonly TwistycontrolBar: TwistyControlBar;
  constructor(public element: Element) {
    this.viewContainer = document.createElement("twisty-view-container");
    this.TwistycontrolBar = new TwistyControlBar(this);

    this.element.appendChild(this.viewContainer);
    this.element.appendChild(this.TwistycontrolBar.element);

    this.draw();
  }

  draw() {
    this.viewContainer.textContent = String(Date.now());
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
  constructor(public twisty: TwistyPlayer) {
    this.element = document.createElement("twisty-control-bar");

    // TODO: Use SVGs or a web font.
    const buttonIcons = [
      "\u2934\uFE0F",
      "\u23EE",
      "\u2B05\uFE0F",
      "\u23EF",
      "\u27A1\uFE0F",
      "\u23ED"
    ];

    for (let i = 0; i < 6; i++) {
      const button = document.createElement("button");
      button.textContent = buttonIcons[i];
      this.element.appendChild(button);
    }
  }
}

window.addEventListener("load", TwistyPlayer.autoInitializePage);
