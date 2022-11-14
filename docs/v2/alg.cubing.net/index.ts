"use strict";

// For debugging.
var t: Twisty.Twisty;

window.addEventListener("load", function() {
  const elem = document.querySelector("twisty");
  if(elem) {
    t = new Twisty.Twisty(elem);
  }
});
