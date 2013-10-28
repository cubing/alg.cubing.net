var s;
var l;


var algxApp = angular.module('algxApp', [
  'algxControllers'
]);

algxApp.config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);


algxApp.filter('abbreviate', function() {
  return function(input) {
    if (input.length > 20) {
       return input.slice(0, 20) + (input.slice(20, 30) + " ").split(" ")[0] + "...";
    }
    return input;
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

  function initParameter(ngName, key, param, fallback, list) {
    var ngNamePlural = ngName + "s"; // Should work for all our cases.
    $scope[ngNamePlural] = list;
    var obj = indexBy(list, key);
    console.log(obj);
    $scope[ngName] = obj[search[param]] || obj[fallback];
  }


  initParameter("puzzle", "name", "puzzle", "3x3x3", [
    {name: "2x2x2", group: "Cube", dimension: 2},
    {name: "3x3x3", group: "Cube", dimension: 3},
    {name: "4x4x4", group: "Cube", dimension: 4},
    {name: "5x5x5", group: "Cube", dimension: 5},
    {name: "6x6x6", group: "Cube", dimension: 6},
    {name: "7x7x7", group: "Cube", dimension: 7}
  ]);

  initParameter("stage", "stage", "stage", "full", [
    {name: "Full", group: "Stage", "stage": "full"},
    {name: "PLL", group: "Stage", "stage": "PLL"},
    {name: "OLL", group: "Stage", "stage": "OLL"},
    {name: "F2L", group: "Stage", "stage": "F2L"}
  ]);

  initParameter("animtype", "type", "type", "algorithm", [
    {name: "Algorithm", group: "Animation Type", type: "algorithm", setup: "Setup", alg: "Algorithm"},
    {name: "Solution", group: "Animation Type", type: "solution", setup: "Setup", alg: "Solution"},
    {name: "Reconstruction", group: "Animation Type", type: "reconstruction", setup: "Scramble", alg: "Solve"}
  ]);

  console.log($scope.animtype.type);

  // TODO: BOY/Japanese translations.
  initParameter("scheme", "scheme", "scheme", "grobyw", [
    {name: "BOY", type: "Color Scheme", scheme: "grobyw", display: "BOY", custom: false},
    {name: "Japanese", type: "Color Scheme", scheme: "groybw", display: "Japanese", custom: false},
    {name: "Custom:", type: "Color Scheme", scheme: "grobyw", display: "", custom: true}
  ]);
  $scope.custom_scheme = $scope.scheme.scheme;

  $scope.speed = 1;
  $scope.current_move = 0;

  $scope.alg = search["alg"] || "";
  $scope.setup = search["setup"] || "";

  $scope.updateLocation = function() {
    $location.replace();
    $location.search('alg',  $scope.alg);
    $location.search('setup', $scope.setup);
    $location.search('puzzle', $scope.puzzle.name);
    $location.search('type', $scope.animtype.type);
    $location.search('scheme', $scope.scheme);
    $location.search('stage', $scope.stage.stage);
    //TODO: Update sharing links
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
      "stage": $scope.stage.stage,
      "allowDragging": true,
      // "hintStickers": true,
      "stickerBorder": false,
      "colors": colorList($scope.scheme.scheme)
    });

    var init = alg.sign_w.stringToAlg($scope.setup);
    var algo = alg.sign_w.stringToAlg($scope.alg);
    var type = $scope.animtype.type;

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
    "animtype",
    "scheme"
  ].map(function(prop){
    $scope.$watch(prop, $scope.twisty_init);
  });

  // For debugging.
  s = function() {
    return $scope;
  };
}]);
