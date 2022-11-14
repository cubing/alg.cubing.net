"use strict";
// TODO: learn how to use modules
var Twisty = (function () {
    function Twisty(element) {
        this.element = element;
        this.canvas = document.createElement("canvas");
        this.controlBar = new TwistyControlBar(this);
        this.element.appendChild(this.canvas);
        this.element.appendChild(this.controlBar.element);
    }
    // Initialize a Twisty for the given Element unless the elements
    // `initialization` attribute is set to `custom`.
    Twisty.smartInitialize = function (elem) {
        var ini = elem.getAttribute("initialization");
        if (ini !== "custom") {
            new Twisty(elem);
        }
    };
    return Twisty;
}());
var TwistyControlBar = (function () {
    function TwistyControlBar(twisty) {
        this.twisty = twisty;
        this.element = document.createElement("twisty-control-bar");
        // TODO: Use SVGs or a web font.
        var buttonIcons = [
            "\u2934\uFE0F",
            "\u23EE",
            "\u2B05\uFE0F",
            "\u23EF",
            "\u27A1\uFE0F",
            "\u23ED"
        ];
        for (var i = 0; i < 6; i++) {
            var button = document.createElement("button");
            button.textContent = buttonIcons[i];
            this.element.appendChild(button);
        }
    }
    return TwistyControlBar;
}());
window.addEventListener("load", function () {
    var elems = document.querySelectorAll("twisty");
    console.log("Found " + elems.length + " twisty elem" + (elems.length === 1 ? "" : "s") + " on page.");
    for (var i = 0; i < elems.length; i++) {
        Twisty.smartInitialize(elems[i]);
    }
});
