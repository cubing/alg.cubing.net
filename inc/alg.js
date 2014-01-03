var s;
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
    {id: "moves", name: "Moves", group: "Start from Setup", setup: "Setup", alg: "Moves", type: "gen", moves: "moves"},
    {id: "reconstruction", name: "Reconstruction", group: "Start from Setup", setup: "Scramble", alg: "Solve", type: "gen", moves: "reconstruction moves"}
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

  $scope.title_default = "";
  $scope.title = $scope.title_default;
  if ("title" in search) {
    $scope.title = search["title"];
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
    console.log(name);
    console.log(_default);
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
      text = $scope.setup + "\n\n" + text;
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
    "y": 0x888800,
    "w": 0xaaaaaa,
    "b": 0x000088,
    "g": 0x008800,
    "o": 0x884400,
    "r": 0x660000,
    "x": 0x222222
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

  $scope.twisty_init = function() {

    $("#viewer").empty();

    twistyScene = new twistyjs.TwistyScene();
    $("#viewer").append($(twistyScene.getDomElement()));

    twistyScene.initializeTwisty({
      "type": "cube",
      "dimension": $scope.puzzle.dimension,
      "stage": $scope.stage.id,
      "allowDragging": true,
      // "hintStickers": true,
      "stickerBorder": false,
      "colors": colorList($scope.scheme.scheme)
    });

    var init = alg.sign_w.stringToAlg($scope.setup);
    var algo = alg.sign_w.stringToAlg($scope.alg);
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

    twistyScene.cam(0.5);

    $(window).resize(twistyScene.resize);

    $("#moveIndex").val(0); //TODO: Move into twisty.js

    $("#play").click(twistyScene.startAnimation);
    $("#step").click(function() {
      twistyScene.startAnimation();
      twistyScene.stopPlayback();
    });
    $("#pause").click(twistyScene.stopPlayback);
    $("#rewind").click(function() {
      twistyScene.setIndex(-1);
      $("#currentMove").val(0); //TODO: Move into twisty.js
    });
    $("#fast_forward").click(function() {
      twistyScene.setIndex(twistyScene.getMoveList().length-1);
    });
    $("#currentMove").attr("max", algo.length);
    // $("#currentMove").bind("change", function() {
    //   var currentMove = $('#currentMove')[0].valueAsNumber;
    //   twistyScene.setIndex(currentMove - 1);
    // });


    var fire = true;
    twistyScene.addMoveListener(function() {
      // console.log(twistyScene.debug.getIndex());
      var idx = twistyScene.debug.getIndex() + 1;
      var val = $scope.current_move;
      if (idx != val && fire) {
        fire = false;
        $scope.$apply("current_move = " + idx);
        fire = true;
      }
    });
    $scope.$watch('current_move', function() {
      var idx = twistyScene.debug.getIndex() + 1;
      var val = $scope.current_move;
      if (idx != val && fire) {
        fire = false;
        twistyScene.setIndex($scope.current_move - 1);
        fire = true;
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
  s = $scope;
  l = $location;
}]);
