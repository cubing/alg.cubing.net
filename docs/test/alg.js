"use strict";

var ss;
var l;


var algxApp = angular.module('algxApp', [
  'algxControllers'
]);

algxApp.config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);


algxApp.filter('title', function() {
  return function(input, title) {
    var prefix = title ? title + " | " : "";
    if (input.length > 20) {
       return prefix + input.slice(0, 20) + (input.slice(20, 30) + " ").split(" ")[0] + "...";
    }
    return prefix + input;
  };
});

var algxControllers = angular.module('algxControllers', ['monospaced.elastic']);

algxControllers.controller('algxController', ["$scope", "$location", function($scope, $location) {

  var touchBrowser = ("ontouchstart" in document.documentElement);
  var fire = true;

  if (touchBrowser) {
    $scope.hollow = true;
  }

  var search = $location.search();

  function indexBy(list, key) {
    var obj = {};
    for(var i in list) {
      obj[list[i][key]] = list[i];
    }
    return obj;
  }

  function initParameter(param, fallback, list) {
    var obj = indexBy(list, "id");
    $scope[param] = obj[search[param]] || obj[fallback];
    $scope[param + "_list"] = list;
    $scope[param + "_default"] = fallback;
  }


  initParameter("puzzle", "3x3x3", [
    {id: "2x2x2", name: "2x2x2", group: "Cube", dimension: 2},
    {id: "3x3x3", name: "3x3x3", group: "Cube", dimension: 3},
    {id: "4x4x4", name: "4x4x4", group: "Cube", dimension: 4},
    {id: "5x5x5", name: "5x5x5", group: "Cube", dimension: 5},
    {id: "6x6x6", name: "6x6x6", group: "Cube", dimension: 6},
    {id: "7x7x7", name: "7x7x7", group: "Cube", dimension: 7},
    {id: "8x8x8", name: "8x8x8", group: "Cube", dimension: 8},
    {id: "9x9x9", name: "9x9x9", group: "Cube", dimension: 9},
    {id: "17x17x17", name: "17x17x17", group: "Cube", dimension: 17} // Over the top!
  ]);

  initParameter("stage", "full", [
    {"id": "full", name: "Full", group: "Stage"},
    {"id": "PLL", name: "PLL", group: "Fridrich"},
    {"id": "OLL", name: "OLL", group: "Fridrich"},
    {"id": "F2L", name: "F2L", group: "Fridrich"},
    {"id": "CLS", name: "CLS", group: "MGLS"},
    {"id": "ELS", name: "ELS", group: "MGLS"},
    {"id": "L6E", name: "L6E", group: "Roux"}
  ]);

  initParameter("type", "moves", [
    {
      id: "moves",
      name: "Moves",
      group: "Start from Setup",
      setup: "Setup",
      alg: "Moves",
      type: "generator",
      setup_moves: "setup moves",
      alg_moves: "moves",
      reconstruction: false
    },
    {
      id: "reconstruction",
      name: "Reconstruction",
      group: "Start from Setup",
      setup: "Scramble",
      alg: "Solve",
      type: "generator",
      setup_moves: "scramble moves",
      alg_moves: "reconstruction moves",
      reconstruction: true
    },
    {
      id: "alg",
      name: "Algorithm",
      group: "End Solved / End with Setup",
      setup: "Setup",
      alg: "Algorithm",
      type: "solve",
      setup_moves: "setup moves for end position",
      alg_moves: "algorithm moves",
      reconstruction: false
    },
    {
      id: "reconstruction-end-with-setup",
      name: "Reconstruction (no scramble)",
      group: "End Solved / End with Setup",
      setup: "Setup",
      alg: "Solve",
      type: "solve",
      setup_moves: "setup moves for end position",
      alg_moves: "reconstruction moves",
      reconstruction: true
    }
  ]);

  // TODO: BOY/Japanese translations.
  initParameter("scheme", "boy", [
    {id: "boy", name: "BOY", type: "Color Scheme", scheme: "grobyw", display: "BOY", custom: false},
    {id: "japanese", name: "Japanese", type: "Color Scheme", scheme: "groybw", display: "Japanese", custom: false},
    {id: "custom", name: "Custom:", type: "Color Scheme", scheme: "grobyw", display: "", custom: true}
  ]);
  $scope.custom_scheme = "";

  $scope.speed = 1;
  $scope.current_move = "0";

  $scope.setupValid = true;
  $scope.algValid = true;

  initParameter("view", "editor", [
    {id:     "editor", next:   "playback", fullscreen: false, infoPane:  true, extraControls:  true, hightlightMoveFields:  true},
    {id:   "playback", next: "fullscreen", fullscreen: false, infoPane:  true, extraControls: false, hightlightMoveFields: false},
    {id: "fullscreen", next:     "editor", fullscreen:  true, infoPane: false, extraControls: false, hightlightMoveFields: false}
  ]);

  $scope.title_default = "";
  $scope.title = $scope.title_default;
  if ("title" in search) {
    $scope.title = search["title"];
  }

  $scope.nextView = function() {
    // TODO: Is there a better way to do view cycling?
    var idx = $scope.view_list.indexOf($scope.view);
    $scope.view = $scope.view_list[(idx + 1) % ($scope.view_list.length)];
    $scope.updateLocation();
  }

  $scope.expand = function() {
    var algo = alg.cube.stringToAlg($scope.alg);
    var moves = alg.cube.algToMoves(algo);
    var expandedAlgStr = alg.cube.algToString(moves);
    $scope.alg = expandedAlgStr;
  }

  $scope.simplify = function() {
    var algo = alg.cube.stringToAlg($scope.alg);
    var simplifiedAlg = alg.cube.algSimplify(algo);
    var simplifiedAlgStr = alg.cube.algToString(simplifiedAlg);
    $scope.alg = simplifiedAlgStr;
    $scope.addHistoryCheckpoint = true;
  }

  $scope.invert = function() {
    // TODO: Invert inside commutator. (Current behaviour is correct, just not as useful).
    var algo = alg.cube.stringToAlg($scope.alg);
    var invertedAlg = alg.cube.invert(algo);
    var invertedAlgStr = alg.cube.algToString(invertedAlg);
    $scope.alg = invertedAlgStr;
    $scope.addHistoryCheckpoint = true;
  }

  $scope.image = function() {
      var canvas = document.getElementsByTagName("canvas")[0];
      var img = canvas.toDataURL("image/png");
      $("#canvasPNG").fadeTo(0, 0);
      $("#canvasPNG").html('<a href="' + img + '" target="blank"><img src="'+img+'"/></a>');
      $("#canvasPNG").fadeTo("slow", 1);
  }

  function escape_alg(alg) {
    if (!alg) {return alg;}
    var escaped = alg;
    escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
    escaped = escaped.replace(/\+/g, "&#2b;");
    escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
    return escaped;
  }

  function unescape_alg(alg) {
    if (!alg) {return alg;}
    var unescaped = alg;
    unescaped = unescaped.replace(/-/g, "'").replace(/&#45;/g, "-");
    unescaped = unescaped.replace(/\+/g, " ").replace(/&#2b;/g, "+"); // Recognize + as space. Many URL encodings will do this.
    unescaped = unescaped.replace(/_/g, " ").replace(/&#95;/g, "_");
    return unescaped;
  }

  $scope.alg_default = "";
  $scope.alg = unescape_alg(search["alg"]) || $scope.alg_default;
  $scope.setup_default = "";
  $scope.setup = unescape_alg(search["setup"]) || $scope.setup_default;

  function setWithDefault(name, value) {
    var _default = $scope[name + "_default"];
    // console.log(name);
    // console.log(_default);
    $location.search(name, (value == _default) ? null : value);
  }

  function forumLinkText(url) {
    var algWithCommentsGreyed = ($scope.alg+"\n").replace(
      /(\/\/.*)[\n\r]/g, "[COLOR=\"gray\"]$1[/COLOR]\n").replace(
      /(\/\*[^(\*\/)]*\*\/)/g, "[COLOR=\"gray\"]$1[/COLOR]"
    );
    var text = algWithCommentsGreyed +
      '\n[COLOR="gray"]// View at [URL="' +
      url +
      '"]alg.cubing.net[/URL][/COLOR]';
    if ($scope.setup !== "") {
      text = "[COLOR=\"gray\"]/* Scramble */[/COLOR]\n" +
        $scope.setup +
        "\n\n [COLOR=\"gray\"]/* Solve */[/COLOR]\n" +
        text
    }
    return text.trim(); // The trim is redundant for angular.js, but let's keep it just in case.
  }

  $scope.updateLocation = function() {
    $location.replace();
    setWithDefault("alg", escape_alg($scope.alg));
    setWithDefault("setup", escape_alg($scope.setup));
    setWithDefault("puzzle", $scope.puzzle.id);
    setWithDefault("type", $scope.type.id);
    setWithDefault("scheme", $scope.scheme.id);
    setWithDefault("stage", $scope.stage.id);
    setWithDefault("title", $scope.title);
    setWithDefault("view", $scope.view.id);
    //TODO: Update sharing links

    // TODO: Inject playback view into parameters properly.
    // Right now it's fine because the view paramater is hidden in editor view, which is the only time you see a forum link.
    $scope.share_url = "http://alg.cubing.net" + $location.url();
    if ($location.url().indexOf("?") !== -1) {
      $scope.share_url += '&view=playback';
    }
    $scope.share_forum_short = "[URL=\"" + $scope.share_url + "\"]" + $scope.alg + "[/URL]";
    $scope.share_forum_long = forumLinkText($scope.share_url);
  };

  var colorMap = {
    "y": 0xffff00,
    "w": 0xffffff,
    "b": 0x0000ff,
    "g": 0x00ff00,
    "o": 0xff8800,
    "r": 0xff0000,
    "x": 0x444444
  };

  var lightColorMap = {
    "y": 0xdddd00,
    "w": 0xcccccc,
    "b": 0x000099,
    "g": 0x00bb00,
    "o": 0xbb6600,
    "r": 0xaa0000,
    "x": 0x333333
  };

  function colorList(str) {
    var out = [];
    var outLight = [];
    var str2 = ("x" + str).split("");
    var reorder = [0, 6, 3, 1, 2, 4, 5];
    for (var i in str2) {
      out.push(colorMap[str2[reorder[i]]]);
      outLight.push(lightColorMap[str2[reorder[i]]]);
    }
    return out.concat(outLight);
  }

  function locationToIndex(text, line, column) {
    var lines = $scope.alg.split("\n");
    var index = 0;
    for (var i = 0; i < line-1; i++) {
      index += lines[i].length + 1;
    }
    return index + column;
  }

  // We set this variable outside so that it will be overwritten.
  // This currently helps with performance, presumably due to garbage collection.
  var twistyScene;

  var selectionStart = document.getElementById("algorithm").selectionStart;

  $scope.twisty_init = function() {

    $("#viewer").empty();

    // var webgl = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
    // var Renderer = webgl ? THREE.WebGLRenderer : THREE.CanvasRenderer;
    // I can't get the WebGLRenderer to look nice as consistently, so let's use CanvasRenderer all the time.
    var Renderer = THREE.CanvasRenderer;

    twistyScene = new twisty.scene({
      "allowDragging": true,
      renderer: Renderer
    });
    $("#viewer").append($(twistyScene.getDomElement()));

    twistyScene.initializePuzzle({
      "type": "cube",
      "dimension": $scope.puzzle.dimension,
      "stage": $scope.stage.id,
      "hintStickers": $scope.hint_stickers,
      "cubies": !$scope.hollow,
      "stickerBorder": false,
      "doubleSided": !$scope.hint_stickers,
      // "borderWidth": 1,
      "colors": colorList($scope.scheme.scheme)
    });

    try {
      var algoFull = alg.cube.stringToAlg($scope.alg);
      $scope.algValid = true;
    } catch (e) {
      $scope.algValid = false;
    }

    try {
      var init = alg.cube.stringToAlg($scope.setup);
      $scope.setupValid = true;
    } catch (e) {
      $scope.setupValid = false;
    }

    var type = $scope.type.type;

    init = alg.cube.algToMoves(init);
    var algo = alg.cube.algToMoves(algoFull);

    twistyScene.setupAnimation(
      algo,
      {
        init: init,
        type: type
      }
    );

    // Temporary hack to work around highlighting bug.
    function isNested(alg) {
      for (var move in alg) {
        var type = alg[move].type;
        if (type == "commutator" || type == "conjugate" || type == "group") {
          return true;
        }
      }
      return false;
    }
    var algNested = isNested(algoFull);

    function highlightCurrentMove(force) {
      if (!force && (algNested || touchBrowser || !$scope.animating)) {
        return;
      }
      // TODO: Make a whole lot more efficient.
      if (Math.floor(parseFloat($scope.current_move)) >= algo.length) {
        return;
      }
      // var current_move = algo[Math.floor($scope.current_move)];
      // var newStart = locationToIndex($scope.alg, current_move.location.first_line, current_move.location.first_column);
      // var newEnd = locationToIndex($scope.alg, current_move.location.last_line, current_move.location.last_column);
      // if (document.getElementById("algorithm").selectionStart !== newStart) {
      //   document.getElementById("algorithm").selectionStart = newStart;
      // }
      // if (document.getElementById("algorithm").selectionEnd !== newEnd) {
      //   document.getElementById("algorithm").selectionEnd = newEnd;
      // }
    }

    twistyScene.setCameraPosition(0.5, 3);

    $(window).resize(twistyScene.resize);
    $scope.$watch("view", twistyScene.resize);

    $("#moveIndex").val(0); //TODO: Move into twisty.js

    function getCurrentMove() {
      // console.log(twistyScene.debug.getIndex());
      var idx = twistyScene.getPosition();
      var val = parseFloat($scope.current_move);
      if (idx != val && fire) {
        $scope.$apply("current_move = " + idx);
        // TODO: Move listener to detect index change.
        highlightCurrentMove();
      }
    }

    function gettingCurrentMove(f) {
      return function() {
        f();
        getCurrentMove();
      }
    }

    // TODO: With a single twistyScene this own't be necessary
    $("#reset").unbind("click");
    $("#back").unbind("click");
    $("#play").unbind("click");
    $("#pause").unbind("click");
    $("#forward").unbind("click");
    $("#skip").unbind("click");
    $(document).unbind("selectionchange");

    var start = gettingCurrentMove(twistyScene.play.start);
    var reset = gettingCurrentMove(twistyScene.play.reset);

    $("#reset").click(reset);
    $("#back").click(gettingCurrentMove(twistyScene.play.back));
    $("#play").click(function() {
      var algEnded = (parseFloat($scope.current_move) === algo.length);
      if (algEnded) {
        $(document.getElementById("viewer").children[0].children[0])
          .fadeOut(100, reset)
          .fadeIn(400, start);
      }
      else {
        start();
      }
    });
    $("#pause").click(gettingCurrentMove(twistyScene.play.pause));
    $("#forward").click(gettingCurrentMove(twistyScene.play.forward));
    $("#skip").click(gettingCurrentMove(twistyScene.play.skip));

    $("#currentMove").attr("max", algo.length);
    // $("#currentMove").bind("change", function() {
    //   var currentMove = $('#currentMove')[0].valueAsNumber;
    //   twistyScene.setIndex(currentMove - 1);
    // });

    function followSelection(apply) {
      selectionStart = document.getElementById("algorithm").selectionStart;
      for (var i = 0; i < algo.length; i++) {
        var move = algo[i];
        var loc = locationToIndex($scope.alg, move.location.first_line, move.location.first_column);
        if (loc >= selectionStart) {
          break;
        }
      }
      fire = false;
      if(apply) {
        $scope.$apply("current_move = " + i);
      }
      twistyScene.setPosition(parseFloat($scope.current_move));
      fire = true;
      return;
    }

    $(document).bind("selectionchange", function(event) {
      if (selectionStart != document.getElementById("algorithm").selectionStart) {
        followSelection(true);
      }
    });

    // followSelection(false);

    // twistyScene.play.reset();
    twistyScene.addListener("animating", function(animating) {
      $scope.$apply("animating = " + animating);
    });
    twistyScene.addListener("position", getCurrentMove);
    $scope.$watch('current_move', function() {
      var idx = twistyScene.getPosition();
      var val = parseFloat($scope.current_move);
      if (idx != val && fire) {
        highlightCurrentMove(true);
        // We need to parse the string.
        // See https://github.com/angular/angular.js/issues/1189 and linked issue/discussion.
        twistyScene.setPosition(parseFloat($scope.current_move));
      }
    });
    $scope.$watch('speed', function() {
      twistyScene.setSpeed($scope.speed);
    }); // initialize the watch

    $scope.updateLocation();
  };

  [
    "setup",
    "alg",
    "puzzle",
    "stage",
    "type",
    "scheme",
    "title",
    "hint_stickers",
    "hollow"
  ].map(function(prop){
    $scope.$watch(prop, $scope.twisty_init);
  });

  var metrics = ["obtm", "btm", "obqtm", "etm"];

  function updateMetrics() {
    var algo = alg.cube.stringToAlg($scope.alg);
    for (var i in metrics) {
      var metric = metrics[i];
      $scope[metric] = alg.cube.countMoves(algo, metric, $scope.puzzle.dimension);
    }
  }
  $scope.$watch("alg", updateMetrics);

  // For debugging.
  ss = $scope;
  l = $location;
}]);
