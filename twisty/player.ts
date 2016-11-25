"use strict";

namespace Twisty {

export class Player {
  private anim: Anim.Model;
  constructor(public element: Element) {
    this.anim = new Anim.Model(new Anim.SimpleBreakPoints([0, 1000, 1500, 2500]));

    this.element.appendChild((new Twisty.Widget.CursorTextView(this.anim)).element);
    this.element.appendChild((new Twisty.Widget.Scrubber(this.anim)).element);
    this.element.appendChild((new Twisty.Widget.ControlBar(this.anim, this.element)).element);
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