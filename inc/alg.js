var s;

function algxController($scope) {
  $scope.puzzles = [
    {name:"2x2x2", type: "Cube", dimension: 2},
   $scope.puzzle =
    {name:"3x3x3", type: "Cube", dimension: 3},
    {name:"4x4x4", type: "Cube", dimension: 4},
    {name:"5x5x5", type: "Cube", dimension: 5},
    {name:"6x6x6", type: "Cube", dimension: 6},
    {name:"7x7x7", type: "Cube", dimension: 7}
  ];

  $scope.stages = [
   $scope.stage =
    {name:"Full", type: "Stage", "stage": "full"},
    {name:"PLL", type: "Stage", "stage": "PLL"},
    {name:"OLL", type: "Stage", "stage": "OLL"},
    {name:"F2L", type: "Stage", "stage": "F2L"}
  ];

  $scope.animtypes = [
   $scope.animtype =
    {name:"Algorithm", gruop: "Animation Type", type: "gen", setup: "Setup", alg: "Algorithm"},
    {name:"Solution", gruop: "Animation Type", type: "solve", setup: "Setup", alg: "Solution"},
    {name:"Reconstruction", gruop: "Animation Type", type: "gen", setup: "Scramble", alg: "Solve"}
  ];

  $scope.schemes = [
   $scope.scheme =
    {name:"BOY", type: "Color Scheme", scheme: "grobyw", display: "BOY", custom: false},
    {name:"Japanese", type: "Color Scheme", scheme: "groybw", display: "Japanese", custom: false},
    {name:"Custom:", type: "Color Scheme", display: "", custom: true}
  ];
  $scope.custom_scheme = "grobyw";

  $scope.speed = 1;
  $scope.current_move = 0;

  $scope.alg = "x y' // inspection\nF R D L F // cross\nU R U' R' d R' U R // 1st pair\ny U2' R' U' R // 2nd pair\nU L U' L' d R U' R' // 3rd pair\ny' U' R U R' U R U' R' // 4th pair (OLS)\nR2' U' R' U' R U R U R U' R U2' // PLL";
  $scope.setup = "D2 U' R2 U F2 D2 U' R2 U' B' L2 R' B' D2 U B2 L' D' R2";

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
}