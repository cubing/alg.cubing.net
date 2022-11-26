/*
 * twisty_demo.js
 * 
 * Demonstration and testing harness for WSOH.
 * 
 * TOOD
 * - Fix document.getElementById(...) calls.
        // TODO I can imagine that some users of twisty.js would want to be able to have a Heise-style
        // inspection, where you are only allowed to do inspection moves during inspection, rather than
        // just starting the timer when they do a turn. This will require somehow being able to cancel/prevent a move?
        // TODO clicking on canvas doesn't seem to focus window in firefox
        // TODO clicking and dragging is weird when the mouse leaves the window
        // TODO keydown doesn't repeat on firefox
 * 
 */

"use strict";

var cache = window.applicationCache;
function updateReadyCache() {
  window.applicationCache.swapCache();
  location.reload(true); // For now
}

var startTime = null;
var stopTime = null;
function startTimer() {
  startTime = new Date().getTime();
  stopTime = null;
  refreshTimer();
  startRefreshTimerLoop();
}
function isTiming() {
  return startTime != null && stopTime == null;
}
function stopTimer() {
  assert(startTime);
  stopTime = new Date().getTime();
  refreshTimer();
  stopRefreshTimerLoop();
}

function resetTimer() {
  startTime = null;
  stopTime = null;
  refreshTimer();
  stopRefreshTimerLoop();
}

function refreshTimer() {
  var timer = $("#timer");
  timer.removeClass("reset running stopped");
  if(isTiming()) {
    timer.addClass("running");
    timer.text(prettyTime(new Date().getTime()));
  } else if(startTime == null) {
    assert(stopTime == null);
    timer.addClass("reset");
    timer.text("[Timer]");
  } else if(stopTime != null) {
    assert(startTime);
    timer.addClass("stopped");
    timer.text(prettyTime(stopTime));
  }
}

var pendingTimerRefresh = null;
function startRefreshTimerLoop() {
  if(pendingTimerRefresh == null) {
    pendingTimerRefresh = requestAnimationFrame(refreshTimerLoop, $('#timer')[0]);
  }
}
function stopRefreshTimerLoop() {
  if(pendingTimerRefresh != null) {
    cancelRequestAnimationFrame(pendingTimerRefresh);
    pendingTimerRefresh = null;
  }
}
function refreshTimerLoop() {
  refreshTimer();
  if(pendingTimerRefresh != null) {
    pendingTimerRefresh = requestAnimationFrame(refreshTimerLoop, $('#timer')[0]);
  }
}

function pad(n, minLength) {
  var str = '' + n;
  while (str.length < minLength) {
    str = '0' + str;
  }
  return str;
}

function prettyTime(endTime) {
  var cumulative = endTime - startTime;
  var str = "";
  str += Math.floor(cumulative/1000/60);
  str += ":";
  str += pad(Math.floor(cumulative/1000 % 60), 2);
  str += ".";
  str += pad(Math.floor((cumulative % 1000) / 10), 2);
  return str;
}


var CubeState = {
  solved: 0,
  scrambling: 1,
  scrambled: 2,
  solving: 3,
};
var cubeState = null;

var twistyScene;

$(document).ready(function() {

  var webgl = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
  // Try WebGL  
  if (webgl) {
    $('#renderer_WebGL').attr('checked', true)
  }

  /*
   * Caching Stuff.
   */


  cache.addEventListener('updateready', updateReadyCache, false);

  log("Document ready.");

  var currentCubeSize = parseInt($("#cubeDimension").val());
  reloadCube();

  $("#cubeDimension").bind("input", reDimensionCube);
  $("#allow_dragging").bind("change", reloadCube);
  $("#double_sided").bind("change", reloadCube);
  $("#sticker_border").bind("change", reloadCube);
  $("#cubies").bind("change", reloadCube);
  $("#hint_stickers").bind("change", reloadCube);

  $('input[name="stage"]').bind("change", reloadCube);

  $("#alg_ccc").bind("click", function() {
    twistyScene.queueMoves(makeCCC(parseInt($("#cubeDimension").val())));
    twistyScene.play.start();
  });

  $("#lucasparity").bind("click", function() {
    var lucasparity = alg.cube.fromString("r U2 x r U2 r U2 r' U2 L U2 r' U2 r U2 r' U2 r'");
    twistyScene.queueMoves(lucasparity);
    twistyScene.play.start();
  });

  $('input[name="renderer"]').click(reloadCube);

  $("#play").click(twistyScene.play.start);
  $("#previous").click(twistyScene.play.back);
  $("#pause").click(twistyScene.play.pause);
  $("#rewind").click(twistyScene.play.reset);
  $("#next").click(twistyScene.play.forward);
  $("#fast_forward").click(twistyScene.play.skip);
  $("#speed").bind("change", function() {
    var speed = $('#speed')[0].valueAsNumber
    twistyScene.setSpeed(speed);
  });

  $("#alg_superflip").bind("click", function() {
    var once = "M' U' M' U' M' U' M' U' x y ";
    var superflip = alg.cube.fromString(once + once + once);
    twistyScene.queueMoves(superflip);
    twistyScene.play.start();
  });

  $("#parsed_alg1").bind("click", function() {
    var algo = alg.cube.fromString($("#parse_alg").val());
    var moves = alg.cube.algToMoves(algo);
    twistyScene.queueMoves(moves);
    twistyScene.play.start();
  });

  $("#parsed_alg2").bind("click", function() {
    var init = alg.cube.fromString($("#init").val());
    var algo = alg.cube.fromString($("#parse_alg").val());
    var type = $("#solve").is(':checked') ? "solve" : "gen";

    init = alg.cube.algToMoves(init);
    algo = alg.cube.algToMoves(algo);

    twistyScene.setupAnimation(
      algo,
      {
        init: init,
        type: type
      }
    );

    var moveList = twistyScene.getMoveList();f
    var pl = $("#playback_alg");
    pl.empty();

    function f(str, i) {
      var el = $("<span>", {text: str});
      var f = (function(idx) {twistyScene.setIndex(idx);}).bind(this, i);
      el.click(f);
      pl.append(el);
    }

    f("Click:", -1);
    for (var i = 0; i < moveList.length; i += 1) {
      var moveString = alg.cube.algToString([moveList[i]]);
      f(moveString, i);
    }
  });

  twistyScene.setCameraPosition(0);

  $("#enableOfflineSupport").bind("click", function() {
    window.location.href = "inc/offline/offline.html";
  });

  $("#createCanvasPNG").bind("click", function() {
    var canvas = twistyScene.getCanvas();
    var img = canvas.toDataURL("image/png");
    log("Generating image...");
    $("#canvasPNG").fadeTo(0, 0);
    $("#canvasPNG").html('<a href="' + img + '" target="blank"><img src="'+img+'"/></a>');
    $("#canvasPNG").fadeTo("slow", 1);
  });

  function reDimensionCube() {
    var dim = parseInt($("#cubeDimension").val());
    if (!dim) {
      dim = 3;
    }
    dim = Math.min(Math.max(dim, 1), 16);
    if (dim != currentCubeSize) {
      currentCubeSize = dim;
      reloadCube();
    }
    resetTimer();
  }

  // From alg.garron.us
  function escapeAlg(algstr){return algstr.replace(/\n/g, '%0A').replace(/-/g, '%2D').replace(/\'/g, '-').replace(/ /g, '_');}

  function reloadCube() {
    log("Current cube size: " + currentCubeSize);

    var renderer = THREE[$('input[name="renderer"]:checked').val() + "Renderer"]; //TODO: Unsafe
    var stage = $('input[name="stage"]:checked').val();
    var speed = $('#speed')[0].valueAsNumber;

    twistyScene = new twisty.scene({
      renderer: renderer,
      allowDragging: $("#allow_dragging").is(':checked'),
      "speed": speed,
      stats: true
    });
    $("#twistyContainer").empty();
    $("#twistyContainer").append($(twistyScene.getDomElement()));

    twistyScene.initializePuzzle({
      "type": "cube",
      "dimension": currentCubeSize,
      "stage": stage,
      "doubleSided": $("#double_sided").is(':checked'),
      "cubies": $("#cubies").is(':checked'),
      "hintStickers": $("#hint_stickers").is(':checked'),
      "stickerBorder": $("#sticker_border").is(':checked')
    });
    $("#cubeDimension").blur(); 
    twistyScene.resize();
    cubeState = CubeState.solved;
    resetTimer();

    twistyScene.addListener("moveStart", function(move) {
      if(cubeState == CubeState.scrambling) {
        // We don't want to start the timer if we're scrambling the cube.
      } else if(cubeState == CubeState.scrambled) {
        if(twistyScene.debug.model.twisty.isInspectionLegalMove(move)) {
          return;
        }
        startTimer();
        cubeState = CubeState.solving;
      }
    });

    twistyScene.addListener("moveAdvance", function(move) {
      if(cubeState == CubeState.solving && twistyScene.debug.model.twisty.isSolved()) {
        cubeState = CubeState.solved;
        stopTimer();
      }
    });
  }

  $(window).resize(twistyScene.resize);

  // TODO add visual indicator of cube focus --jfly
  // clear up canvasFocused stuff...
  //$("#twistyContainer").addClass("canvasFocused");
  //$("#twistyContainer").removeClass("canvasFocused");

  $(window).keydown(function(e) {
    // This is kinda weird, we want to avoid turning the cube
    // if we're in a textarea, or input field.
    var focusedEl = document.activeElement.nodeName.toLowerCase();
    var isEditing = focusedEl == 'textarea' || focusedEl == 'input';
    if(isEditing) {
      return;
    }

    var keyCode = e.keyCode;
    switch(keyCode) {
      case 27:
        reloadCube();
        e.preventDefault();
        break;

      case 32:
        if (!isTiming()) {
          var twisty = twistyScene.debug.model.twisty;
          var scramble = twisty.generateScramble(twisty);
          // We're going to get notified of the scrambling, and we don't
          // want to start the timer when that's happening, so we keep track
          // of the fact that we're scrambling.
          cubeState = CubeState.scrambling;
          twistyScene.applyMoves(scramble); //TODO: Use appropriate function.
          twistyScene.redraw(); // Force redraw.
          cubeState = CubeState.scrambled;
          resetTimer();
        }
        e.preventDefault();
        break;
    }

    twistyScene.keydown(e);
  });

});

/*
 * Convenience Logging
 */

var logCounter = 0;

function log(obj) {
  if(typeof(console) !== "undefined" && console.log) {
    //console.log(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = (logCounter++) + ". " + obj + "<hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

function err(obj) {
  if(typeof(console) !== "undefined" && console.error) {
    console.error(obj);
  }
  var previousHTML = $("#debug").html();
  previousHTML = "<div class='err'>" + (logCounter++) + ". " + obj + "</div><hr/>" + previousHTML;
  $("#debug").html(previousHTML);
}

/*
 * Algs for testing
 */

function makeCCC(n) {

  var cccMoves = [];

  for (var i = 1; i<=n/2; i++) {
    var moreMoves = [
      {base: "l", endLayer: i, amount: -1},
      {base: "u", endLayer: i, amount: 1},
      {base: "r", endLayer: i, amount: -1},
      {base: "f", endLayer: i, amount: -1},
      {base: "u", endLayer: i, amount: 1},
      {base: "l", endLayer: i, amount: -2},
      {base: "u", endLayer: i, amount: -2},
      {base: "l", endLayer: i, amount: -1},
      {base: "u", endLayer: i, amount: -1},
      {base: "l", endLayer: i, amount: 1},
      {base: "u", endLayer: i, amount: -2},
      {base: "d", endLayer: i, amount: 1},
      {base: "r", endLayer: i, amount: -1},
      {base: "d", endLayer: i, amount: -1},
      {base: "f", endLayer: i, amount: 2},
      {base: "r", endLayer: i, amount: 2},
      {base: "u", endLayer: i, amount: -1}
    ];

    cccMoves = cccMoves.concat(moreMoves);
  }

  return cccMoves;

}
