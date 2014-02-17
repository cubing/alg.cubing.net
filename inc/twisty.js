var aaa, bbb;

/*
 * model.twisty.js
 *
 * Started by Lucas Garron, July 22, 2011 at WSOH
 * Made classy by Jeremy Fleischman, October 7, 2011 during the flight to worlds
 *
 */

"use strict";

if(typeof(assert) == "undefined") {
  // TODO - this is pretty lame, we could use something like stacktrace.js
  // to get some useful information here.
  var assert = function(cond, str) {
    if(!cond) {
      if(str) {
        throw str;
      } else {
        throw "Assertion Error";
      }
    }
  };
}

var twistyjs = {};

(function() {

/****************
 *
 * twisty.js Plugins
 *
 * Plugins register themselves by calling twistyjs.registerTwisty.
 * This lets plugins be defined in different files.
 *
 */

twistyjs.twisties = {};

twistyjs.TwistyScene = function(options) {

  // that=this is a Crockford convention for accessing "this" inside of methods.
  var that = this;

  /******** Instance Variables ********/

  var model = {
    twisty: null,
    preMoveList: [],
    moveList: [],

    time: null,
    position: null,
  }

  var view = {
    camera: null,
    container: null,
    scene: null,
    renderer: null
  }

  var control = {
    cameraTheta: null,
    mouseXLast: null,

    listeners: {
      animating: [],
      position: []
    },

    speed: null,

    animating: false,
    stopAfterNextMove: false
  }

  this.debug = {
    stats: null,
    model: model,
    view: view,
    control: control
  }


  /******** General Initialization ********/


  var iniDefaults = {
    speed: 1, // qtps is 3*speed
    renderer: THREE.CanvasRenderer,
    allowDragging: true,
    stats: false
  }

  function initialize(options) {
    options = getOptions(options, iniDefaults);

    view.initialize(options.renderer);

    control.speed = options.speed;
    if (options.allowDragging) { that.startAllowDragging(); }
    if (options.stats) { startStats(); }
  }



  /******** Model: Initialization ********/


  this.initializeTwisty = function(twistyType) {

    model.position = 0;
    model.preMoveList = [];
    model.moveList = [];

    model.twisty = createTwisty(twistyType);
    view.scene.add(model.twisty["3d"]);

    that.resize();
  }

  this.resize = function() {
    var width = $(view.container).width();
    var height = $(view.container).height()
    var min = Math.min(width, height);
    view.camera.setViewOffset(min,  min, (min - width)/2, (min - height)/2, width, height);

    moveCameraDelta(0);
    view.renderer.setSize(width, height);
    renderOnce();
  };


  /******** View: Initialization ********/

  view.initialize = function(Renderer) {
    view.scene = new THREE.Scene();
    view.camera = new THREE.PerspectiveCamera( 30, 1, 0.001, 1000 );

    view.renderer = new Renderer({antialias: true});

    var canvas = view.renderer.domElement;
    $(canvas).css('position', 'absolute').css('top', 0).css('left', 0);

    var container = $('<div/>').css('width', '100%').css('height', '100%');
    view.container = container[0];
    container.append(canvas);
  }


  /******** View: Rendering ********/

  function render() {
    view.renderer.render(view.scene, view.camera);
    if (that.debug.stats) {
      that.debug.stats.update();
    }
  }

  function renderOnce() {
    if (!control.animating) {
      requestAnimFrame(render);
    }
  }


  /******** View: Camera ********/


  this.setCameraTheta = function(theta) {
    control.cameraTheta = theta;
    var scale = model.twisty.cameraScale();
    view.camera.position.x = 2.5*Math.sin(theta) * scale;
    view.camera.position.y = 2 * scale;
    view.camera.position.z = 2.5*Math.cos(theta) * scale;
    view.camera.lookAt(new THREE.Vector3(0, -0.075 * scale, 0));
  }

  function moveCameraDelta(deltaTheta) {
    that.setCameraTheta(control.cameraTheta + deltaTheta);
  }


  /******** Control: Mouse/Touch Dragging ********/

  this.startAllowDragging = function() {
    $(view.container).css("cursor", "move");
    view.container.addEventListener("mousedown", onStart, false );
    view.container.addEventListener("touchstart", onStart, false );
  }

  var listeners = {
    "mouse": {
      "mousemove": onMove,
      "mouseup": onEnd
    },
    "touch": {
      "touchmove": onMove,
      "touchend": onEnd
    }
  }

  function eventKind(event) {
    if (event instanceof MouseEvent) {
      return "mouse";
    }
    else if (event instanceof TouchEvent) {
      return "touch";
    }
    throw "Unknown event kind.";
  }

  function onStart(event) {
    var kind = eventKind(event);

    control.mouseXLast = (kind == "mouse") ? event.clientX : event.touches[0].pageX;
    event.preventDefault();
    renderOnce();

    for (listener in listeners[kind]) {
      window.addEventListener(listener, listeners[kind][listener], false);
    }
  }

  function onMove(event) {
    var kind = eventKind(event);

    mouseX = (kind == "mouse") ? event.clientX : event.touches[0].pageX;
    event.preventDefault();
    moveCameraDelta((control.mouseXLast - mouseX)/256);
    control.mouseXLast = mouseX;

    renderOnce();
  }

  function onEnd(event) {
    var kind = eventKind(event);
    for (listener in listeners[kind]) {
      window.removeEventListener(listener, listeners[kind][listener], false);
    }
  }


  /******** Control: Keyboard ********/

  this.keydown = function(e) {

    var keyCode = e.keyCode;
    model.twisty.keydownCallback(model.twisty, e);

    switch (keyCode) {

      case 37: // Left
        moveCameraDelta(Math.PI/24);
        e.preventDefault();
        renderOnce();
        break;

      case 39: // Right
        moveCameraDelta(-Math.PI/24);
        e.preventDefault();
        renderOnce();
        break;

    }
  };


  /******** Control: Move Listeners ********/

  this.addListener = function(kind, listener) {
    control.listeners[kind].push(listener);
  };

  this.removeListener = function(kind, listener) {
    var index = control.listeners[kind].indexOf(listener);
    assert(index >= 0);
    delete control.listeners[kind][index];
  };

  function fireListener(kind, data) {
    for(var i = 0; i < control.listeners[kind].length; i++) {
      control.listeners[kind][i](data);
    }
  }

  // function fireMoveStarted(move) {
  //   for(var i = 0; i < control.listeners.length; i++) {
  //     control.listeners[i](move, true);
  //   }
  // }
  // function fireMoveEnded(move) {
  //   for(var i = 0; i < control.listeners.length; i++) {
  //     control.listeners[i](move, false);
  //   }
  // }


  /******** Control: Animation ********/

  function triggerAnimation() {
    if (!control.animating) {
      model.time = Date.now();
      setAnimating(true);
      animFrame();
    }
  }

  function animFrame() {

    if (control.animating) {

      var prevTime = model.time;
      var prevPosition = model.position;

      model.time = Date.now();
      model.position = prevPosition + (model.time - prevTime) * control.speed * 3 / 1000;

      if (Math.floor(model.position) > Math.floor(prevPosition)) {
        // If we finished a move, snap to the beginning of the next. (Will never skip a move.)
        model.position = Math.floor(prevPosition) + 1;
        var prevMove = model.moveList[Math.floor(prevPosition)];
        model.twisty["animateMoveCallback"](model.twisty, prevMove, 1);
        model.twisty["advanceMoveCallback"](model.twisty, prevMove);

        if (control.stopAfterNextMove) {
          control.stopAfterNextMove = false;
          setAnimating(false);
        }
      }
      else {
        var currentMove = model.moveList[Math.floor(model.position)];
        model.twisty["animateMoveCallback"](model.twisty, currentMove, model.position % 1);
      }

      if (model.position >= totalLength()) {
        model.position = totalLength();
        setAnimating(false);
      }
    }

    render();
    fireListener("position", model.position);

    if (control.animating) {
      requestAnimFrame(animFrame);
    }
  }

  function totalLength() {
    return model.moveList.length;
  }

  function setAnimating(value) {
    control.animating = value;
    fireListener("animating", control.animating);
  }


  /******** Control: Playback ********/

  var setupDefaults = {
    init: [],
    type: "generator"
  }

  this.setupAnimation = function(algIn, options) {
    options = getOptions(options, setupDefaults);

    setAnimating(false);

    model.preMoveList = options.init;
    if (options.type === "solve") {
      var algInverse = alg.sign_w.invert(algIn);
      model.preMoveList = model.preMoveList.concat(algInverse);
    }
    that.applyMoves(model.preMoveList);

    that.queueMoves(algIn);
    renderOnce();
  }

  this.applyMoves = function(moves) {
    for (i in moves) {
      model.twisty["advanceMoveCallback"](model.twisty, moves[i]);
    }
  };

  this.queueMoves = function(moves) {
    model.moveList = model.moveList.concat(moves);
  };

  this.play = {}

  this.play.reset = function() {
    setAnimating(false);
    that.setIndex(0);
  }

  this.play.start = function() {
    triggerAnimation();
  }

  this.play.pause = function() {
    setAnimating(false);
  }

  this.play.skip = function() {
    setAnimating(false);
    that.setIndex(model.moveList.length);
  }

  this.play.forward = function() {
    triggerAnimation();
    control.stopAfterNextMove = true;
  }

  this.play.back = function() {
    var index = Math.ceil(that.getPosition());
    if (index > 0) {
      that.setIndex(index - 1);
    }
  }

  this.setPosition = function(position) {

    // If we're somewhere on the same move, don't recalculate position.
    // Else, recalculate from the beginning, since we don't have something clever yet.
    if (Math.floor(position) !== that.getIndex()) {
      var preMoveListSaved = model.preMoveList;
      var moveListSaved = model.moveList;

      // Hack
      view.scene.remove(model.twisty["3d"]);
      that.initializeTwisty(model.twisty.type);
      model.preMoveList = preMoveListSaved;
      model.moveList = moveListSaved;

      that.applyMoves(model.preMoveList);
      that.applyMoves(model.moveList.slice(0, position)); // Works with fractional positions
    }

    model.position = position;

    if (position < totalLength()) {
      var currentMove = model.moveList[Math.floor(model.position)];
      model.twisty["animateMoveCallback"](model.twisty, currentMove, model.position % 1);
    }

    renderOnce();
    // fireAnimation();
  }

  this.getPosition = function() {
    return model.position;
  }

  this.getIndex = function() {
    return Math.floor(model.position);
  }

  this.setIndex = function(idx) {
    this.setPosition(Math.floor(idx));
  }


  /******** Getters/setters ********/

  this.getMoveList = function() {
    return model.moveList;
  }

  this.getDomElement = function() {
    return view.container;
  }

  this.setSpeed = function(speed) {
    control.speed = speed;
  }

  this.getCanvas = function() {
    return view.renderer.domElement;
  }


  /******** Twisty ********/

  function createTwisty(twistyType) {
    var twistyCreateFunction = twistyjs.twisties[twistyType.type];
    if(!twistyCreateFunction) {
      err('model.twisty type "' + twistyType.type + '" is not recognized!');
      return null;
    }

    return twistyCreateFunction(that, twistyType);
  }


  /******** Debugging ********/

  function startStats() {
    that.debug.stats = new Stats();
    that.debug.stats.domElement.style.position = 'absolute';
    that.debug.stats.domElement.style.top = '0px';
    that.debug.stats.domElement.style.left = '0px';
    view.container.appendChild( that.debug.stats.domElement );
    $(that.debug.stats.domElement).click();
  }


  /******** Convenience Functions ********/

  function getOptions(input, defaults) {
    var output = {};
    for (var key in defaults) {
      output[key] = (key in input) ? input[key] : defaults[key];
    }
    return output;
  }


  /******** Go! ********/

  initialize(options);

};

})();
