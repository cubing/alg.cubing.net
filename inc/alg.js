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

algxApp.filter('num_lines', function() {
  return function(input) {
    return input.split("\n").length;
  };
});

var algxControllers = angular.module('algxControllers', []);

algxControllers.controller('algxController', ["$scope", "$location", function($scope, $location) {

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
    {id: "7x7x7", name: "7x7x7", group: "Cube", dimension: 7}
  ]);

  initParameter("stage", "full", [
    {"id": "full", name: "Full", group: "Stage"},
    {"id": "PLL", name: "PLL", group: "Stage"},
    {"id": "OLL", name: "OLL", group: "Stage"},
    {"id": "F2L", name: "F2L", group: "Stage"}
  ]);

  initParameter("type", "algorithm", [
    {id: "algorithm", name: "Algorithm", group: "End Solved", setup: "Setup", alg: "Algorithm", type: "solve", moves: "algorithm moves"},
    {id: "moves", name: "Moves", group: "Start from Setup", setup: "Setup", alg: "Moves", type: "generator", moves: "moves"},
    {id: "reconstruction", name: "Reconstruction", group: "Start from Setup", setup: "Scramble", alg: "Solve", type: "generator", moves: "reconstruction moves"}
  ]);

  // TODO: BOY/Japanese translations.
  initParameter("scheme", "boy", [
    {id: "boy", name: "BOY", type: "Color Scheme", scheme: "grobyw", display: "BOY", custom: false},
    {id: "japanese", name: "Japanese", type: "Color Scheme", scheme: "groybw", display: "Japanese", custom: false},
    {id: "custom", name: "Custom:", type: "Color Scheme", scheme: "grobyw", display: "", custom: true}
  ]);
  $scope.custom_scheme = "";

  $scope.speed = 1;
  $scope.current_move = 0;

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
    var algo = alg.sign_w.stringToAlg($scope.alg);
    var moves = alg.sign_w.algToMoves(algo);
    var expandedAlgStr = alg.sign_w.algToString(moves);
    $scope.alg = expandedAlgStr;
  }

  $scope.simplify = function() {
    var algo = alg.sign_w.stringToAlg($scope.alg);
    var simplifiedAlg = alg.sign_w.algSimplify(algo);
    var simplifiedAlgStr = alg.sign_w.algToString(simplifiedAlg);
    $scope.alg = simplifiedAlgStr;
    $scope.addHistoryCheckpoint = true;
  }

  $scope.invert = function() {
    // TODO: Invert inside commutator. (Current behaviour is correct, just not as useful).
    var algo = alg.sign_w.stringToAlg($scope.alg);
    var invertedAlg = alg.sign_w.invert(algo);
    var invertedAlgStr = alg.sign_w.algToString(invertedAlg);
    $scope.alg = invertedAlgStr;
    $scope.addHistoryCheckpoint = true;
  }

  function escape_alg(alg) {
    if (!alg) {return alg;}
    return alg.replace(/_/g, '&#95;').replace(/ /g, '_');
  }

  function unescape_alg(alg) {
    if (!alg) {return alg;}
    return alg.replace(/_/g, ' ').replace(/&#95;/g, '_');
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
      '[COLOR="gray"]View at [url=&quot;' +
      url +
      '&quot;]alg.cubing.net[/url][/COLOR]';
    if ($scope.setup !== "") {
      text = "Scramble: " + $scope.setup + "\n\n" + text;
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

    $scope.share_url = "http://alg.cubing.net" + $location.url();
    $scope.share_forum_short = "[url=" + $scope.share_url + "]" + $scope.alg + "[/url]";
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

  $scope.twisty_init = function() {

    $("#viewer").empty();

    var webgl = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
    var Renderer = webgl ? THREE.WebGLRenderer : THREE.CanvasRenderer;

    twistyScene = new twistyjs.TwistyScene({
      "allowDragging": true,
      renderer: Renderer,
      antialiasing: true
    });
    $("#viewer").append($(twistyScene.getDomElement()));

    twistyScene.initializeTwisty({
      "type": "cube",
      "dimension": $scope.puzzle.dimension,
      "stage": $scope.stage.id,
      // "hintStickers": true,
      "stickerBorder": false,
      "colors": colorList($scope.scheme.scheme)
    });

    try {
      var algo = alg.sign_w.stringToAlg($scope.alg);
      $scope.algValid = true;
    } catch (e) {
      $scope.algValid = false;
      throw e;
    }

    try {
      var init = alg.sign_w.stringToAlg($scope.setup);
      $scope.setupValid = true;
    } catch (e) {
      $scope.setupValid = false;
      throw e;
    }

    var type = $scope.type.type;

    init = alg.sign_w.algToMoves(init);
    algo = alg.sign_w.algToMoves(algo);

    twistyScene.setupAnimation(
      algo,
      {
        init: init,
        type: type
      }
    );

    function highlightCurrentMove() {
      // TODO: Make a whole lot more efficient.
      if (Math.floor($scope.current_move) >= algo.length) {
        return;
      }
      var current_move = algo[Math.floor($scope.current_move)];
      newStart = locationToIndex($scope.alg, current_move.location.first_line, current_move.location.first_column);
      newEnd = locationToIndex($scope.alg, current_move.location.last_line, current_move.location.last_column);
      if (document.getElementById("algorithm").selectionStart !== newStart) {
        document.getElementById("algorithm").selectionStart = newStart;
      }
      if (document.getElementById("algorithm").selectionEnd !== newEnd) {
        document.getElementById("algorithm").selectionEnd = newEnd;
      }
    }

    twistyScene.setCameraTheta(0.5);

    $(window).resize(twistyScene.resize);
    $scope.$watch("view", twistyScene.resize);

    $("#moveIndex").val(0); //TODO: Move into twisty.js

    function getCurrentMove() {
      // console.log(twistyScene.debug.getIndex());
      var idx = twistyScene.getPosition();
      var val = $scope.current_move;
      if (idx != val && fire) {
        $scope.$apply("current_move = " + idx);
        // TODO: Move listener to detect index change.
        // highlightCurrentMove();
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

    $("#reset").click(gettingCurrentMove(twistyScene.play.reset));
    $("#back").click(gettingCurrentMove(twistyScene.play.back));
    $("#play").click(gettingCurrentMove(twistyScene.play.start));
    $("#pause").click(gettingCurrentMove(twistyScene.play.pause));
    $("#forward").click(gettingCurrentMove(twistyScene.play.forward));
    $("#skip").click(gettingCurrentMove(twistyScene.play.skip));

    $("#currentMove").attr("max", algo.length);
    // $("#currentMove").bind("change", function() {
    //   var currentMove = $('#currentMove')[0].valueAsNumber;
    //   twistyScene.setIndex(currentMove - 1);
    // });

    // twistyScene.play.reset();
    twistyScene.addListener("animating", function(animating) {
      $scope.$apply("animating = " + animating);
    });

    var fire = true;
    twistyScene.addListener("position", getCurrentMove);
    $scope.$watch('current_move', function() {
      var idx = twistyScene.getPosition();
      var val = $scope.current_move;
      if (idx != val && fire) {
        // highlightCurrentMove();
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
    "title"
  ].map(function(prop){
    $scope.$watch(prop, $scope.twisty_init);
  });

  var metrics = ["obtm", "btm", "obqtm", "etm"];

  function updateMetrics() {
    var algo = alg.sign_w.stringToAlg($scope.alg);
    for (i in metrics) {
      var metric = metrics[i];
      $scope[metric] = alg.sign_w.countMoves(algo, metric, $scope.puzzle.dimension);
    }
  }
  $scope.$watch("alg", updateMetrics);

  // For debugging.
  ss = $scope;
  l = $location;
}]);
