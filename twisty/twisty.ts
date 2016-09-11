"use strict";

// TODO: learn how to use modules

class Twisty {
  private canvas: HTMLCanvasElement;
  private controlBar: TwistyControlBar;
  constructor(public element: Element) {
    this.canvas = document.createElement("canvas");
    this.controlBar = new TwistyControlBar(this);

    this.element.appendChild(this.canvas);
    this.element.appendChild(this.controlBar.element);
  }

  // Initialize a Twisty for the given Element unless the elements
  // `initialization` attribute is set to `custom`.
  static smartInitialize(elem: Element) {
    const ini = elem.getAttribute("initialization");
    if (ini !== "custom") {
      new Twisty(elem);
    }
  }
}

class TwistyControlBar {
  public element;
  constructor(public twisty: Twisty) {
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

window.addEventListener("load", function() {
  const elems = document.querySelectorAll("twisty");
  console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

  for (let i = 0; i < elems.length; i++) {
    Twisty.smartInitialize(elems[i]);
  }
});
