"use strict";
// TODO: learn how to use modules
var TwistyPlayer = (function () {
    function TwistyPlayer(element) {
        this.element = element;
        this.viewContainer = document.createElement("twisty-view-container");
        this.anim = new TwistyAnim(this.draw.bind(this));
        this.controlBar = new TwistyControlBar(this.anim);
        this.element.appendChild(this.viewContainer);
        this.element.appendChild(this.controlBar.element);
        this.draw(0);
    }
    TwistyPlayer.prototype.draw = function (duration) {
        this.viewContainer.textContent = String(Math.floor(duration));
    };
    // Initialize a Twisty for the given Element unless the element's
    // `initialization` attribute is set to `custom`.
    TwistyPlayer.autoInitialize = function (elem) {
        var ini = elem.getAttribute("initialization");
        if (ini !== "custom") {
            new TwistyPlayer(elem);
        }
    };
    TwistyPlayer.autoInitializePage = function () {
        var elems = document.querySelectorAll("twisty");
        console.log("Found " + elems.length + " twisty elem" + (elems.length === 1 ? "" : "s") + " on page.");
        for (var i = 0; i < elems.length; i++) {
            TwistyPlayer.autoInitialize(elems[i]);
        }
    };
    return TwistyPlayer;
}());
var TwistyControlBar = (function () {
    function TwistyControlBar(anim) {
        this.anim = anim;
        this.element = document.createElement("twisty-control-bar");
        // TODO: Use SVGs or a web font for element-relative sizing.
        var buttons = [{
                title: "Cycle display mode",
                icon: "\u2934\uFE0F",
                fn: function () { }
            }, {
                title: "Skip to start",
                icon: "\u23EE",
                fn: anim.reset.bind(anim)
            }, {
                title: "Step back",
                icon: "\u2B05\uFE0F",
                fn: function () { }
            }, {
                title: "Play",
                icon: "\u23EF",
                fn: anim.playPause.bind(anim) // TODO: Toggle between play and pause icon.
            }, {
                title: "Step forward",
                icon: "\u27A1\uFE0F",
                fn: function () { }
            }, {
                title: "Skip to end",
                icon: "\u23ED",
                fn: function () { }
            }];
        for (var i = 0; i < 6; i++) {
            var button = document.createElement("button");
            button.title = buttons[i].title;
            button.textContent = buttons[i].icon;
            this.element.appendChild(button);
            button.addEventListener("click", buttons[i].fn);
        }
    }
    return TwistyControlBar;
}());
window.addEventListener("load", TwistyPlayer.autoInitializePage);
//# sourceMappingURL=player.js.map