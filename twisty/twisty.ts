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
  }
}

window.addEventListener("load", function() {
  const elems = document.querySelectorAll("twisty");
  console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

  for (let i = 0; i < elems.length; i++) {
    Twisty.smartInitialize(elems[i]);
  }
});
