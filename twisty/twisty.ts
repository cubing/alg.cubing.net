"use strict";

namespace Twisty {

// TODO: Turn Twisty into a module and move Twisty.Twisty into Twisty proper.
export class Twisty {
  private alg: Alg.Algorithm;
  private anim: Anim.Model;
  private cursor: Cursor;
  constructor(public element: Element) {
    this.alg = Alg.Example.HeadlightSwaps;
    this.cursor = new Cursor(this.alg);
    // this.timeline = new Timeline(Alg.Example.HeadlightSwaps);
    this.anim = new Anim.Model(this.cursor);

    this.element.appendChild((new Widget.Player(this.anim)).element);
  }
}

// Initialize a Twisty for the given Element unless the element's
// `initialization` attribute is set to `custom`.
function autoInitialize(elem: Element) {
  const ini = elem.getAttribute("initialization");
  if (ini !== "custom") {
    new Twisty(elem);
  }
}

function autoInitializePage() {
  const elems = document.querySelectorAll("twisty");
  console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`)

  for (let i = 0; i < elems.length; i++) {
    autoInitialize(elems[i]);
  }
}

window.addEventListener("load", autoInitializePage);

}