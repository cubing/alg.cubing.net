/*
 * Rubik's Cube NxNxN
 */

"use strict";

twisty.puzzles.cube = function(twistyScene, twistyParameters) {

  // log("Creating cube twisty.");

  // Cube Variables
  var cubeObject = new THREE.Object3D();
  var cubePieces = [];

  var easing = {};
  easing.linear = function(x) { return x; };
  easing.smooth = function(x) {
    x = x * x; // Ease in.
    return x * (2 - x); // Ease out.
  };
  easing.extra_smooth = function(x) {
    return x*x*x*(10-x*(15-6*x));
  };
  easing.boingy_sproingy = function(x) {
    // TODO: make this less jarring.
    var y = x * x; // Ease in.
    return 3 * (y * (2 - y) - (x / 1.5)); // Ease out.
    return x;
  };

  //Defaults
  var cubeOptions = {
    stickerBorder: true,
    borderWidth: 8,
    cubies: false,
    stickerWidth: 1.7,
    doubleSided: true,
    algUpdateCallback: null,
    hintStickers: false,
    opacity: 1,
    dimension: 3,
    easing: easing.smooth,
    colors: [0x444444, 0xffffff, 0xff8800, 0x00ff00, 0xff0000, 0x0000ff, 0xffff00,
    // TODO: Handle extra colors procedurally
               0x222222, 0x888888, 0x884400, 0x008800, 0x660000, 0x000088, 0x888800],
    stage: "full",
    scale: 1,
  };


  // Passed Parameters
  for (var option in cubeOptions) {
    if(option in twistyParameters) {
      // log("Setting option \"" + option + "\" to " + twistyParameters[option]);
      cubeOptions[option] = twistyParameters[option];
    }
  };

  // Cube Constants
  var numSides = 6;

  // Cube Materials
  var materials = {"singleSided": [], "doubleSided": []};
  for (var i = 0; i < cubeOptions.colors.length; i++) {
    for (var j = 0; j < 2; j++) {
      var side = ["singleSided", "doubleSided"][j];
      var material = new THREE.MeshBasicMaterial( { color: cubeOptions.colors[i], overdraw: 0.5 });
      if (side === "doubleSided") {
        material.side = THREE.DoubleSide;
      }
      material.opacity = cubeOptions.opacity;
      materials[side].push(material);
    }
  }

  // Stickering for stages.
  var stageStickers = {};
  stageStickers.full = [
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6]
  ];
  stageStickers.PLL = [
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,9,9,9,9,9,9],
    [3,3,3,10,10,10,10,10,10],
    [4,4,4,11,11,11,11,11,11],
    [5,5,5,12,12,12,12,12,12],
    [13,13,13,13,13,13,13,13,13]
  ];
  stageStickers.OLL = [
    [1,1,1,1,1,1,1,1,1],
    [0,0,0,9,9,9,9,9,9],
    [0,0,0,10,10,10,10,10,10],
    [0,0,0,11,11,11,11,11,11],
    [0,0,0,12,12,12,12,12,12],
    [13,13,13,13,13,13,13,13,13]
  ];
  stageStickers.LL = stageStickers.PLL;
  stageStickers.F2L = [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,2,2,2,2,2,2],
    [0,0,0,3,3,3,3,3,3],
    [0,0,0,4,4,4,4,4,4],
    [0,0,0,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6]
  ];
  stageStickers.cross = [
    [0,0,0,0,8,0,0,0,0],
    [0,0,0,0,9,0,0,2,0],
    [0,0,0,0,10,0,0,3,0],
    [0,0,0,0,11,0,0,4,0],
    [0,0,0,0,12,0,0,5,0],
    [0,6,0,6,6,6,0,6,0]
  ];
  stageStickers.CLS = [
    [1,8,1,8,8,8,1,8,1],
    [0,0,0,9,9,9,9,9,9],
    [0,0,0,10,10,10,10,10,3],
    [0,0,0,11,11,11,4,11,11],
    [0,0,0,12,12,12,12,12,12],
    [13,13,6,13,13,13,13,13,13]
  ];
  stageStickers.ELS = [
    [0,1,0,1,1,1,0,1,0],
    [0,0,0,9,9,9,9,9,9],
    [0,0,0,10,10,3,10,10,0],
    [0,0,0,4,11,11,0,11,11],
    [0,0,0,12,12,12,12,12,12],
    [13,13,0,13,13,13,13,13,13]
  ];
  stageStickers.L6E = [
    [8,1,8,1,1,1,8,1,8],
    [9,2,9,9,9,9,9,9,9],
    [10,3,10,10,3,10,10,3,10],
    [11,4,11,11,11,11,11,11,11],
    [12,5,12,12,5,12,12,5,12],
    [13,6,13,13,6,13,13,6,13]
  ];
  stageStickers.CMLL = [
    [1,0,1,0,0,0,1,0,1],
    [2,0,2,9,9,9,9,9,9],
    [3,0,3,10,0,10,10,0,10],
    [4,0,4,11,11,11,11,11,11],
    [5,0,5,12,0,12,12,0,12],
    [6,0,6,6,0,6,6,0,6]
  ];
  stageStickers.WV = [
    [1,1,1,1,1,1,1,1,1],
    [0,0,0,9,9,9,9,9,9],
    [0,0,0,10,10,3,10,10,3],
    [0,0,0,4,11,11,4,11,11],
    [0,0,0,12,12,12,12,12,12],
    [13,13,6,13,13,13,13,13,13]
  ];
  stageStickers.ZBLL = [
    [1,8,1,8,8,8,1,8,1],
    [2,2,2,9,9,9,9,9,9],
    [3,3,3,10,10,10,10,10,10],
    [4,4,4,11,11,11,11,11,11],
    [5,5,5,12,12,12,12,12,12],
    [13,13,13,13,13,13,13,13,13]
  ];
  stageStickers.void = [
    [1,1,1,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,2,2],
    [3,3,3,3,0,3,3,3,3],
    [4,4,4,4,0,4,4,4,4],
    [5,5,5,5,0,5,5,5,5],
    [6,6,6,6,0,6,6,6,6]
  ];

  var isVoidCube = cubeOptions.stage == "void";

  var stickers = stageStickers.full;
  if (cubeOptions.stage in stageStickers) {
    stickers = stageStickers[cubeOptions.stage];
  }

  // Cube Helper Linear Algebra
  function axify(v1, v2, v3) {
    var ax = new THREE.Matrix4();
    ax.set(
        v1.x, v2.x, v3.x, 0,
        v1.y, v2.y, v3.y, 0,
        v1.z, v2.z, v3.z, 0,
        0   , 0   , 0   , 1
    );
    return ax;
  }

  var xx = new THREE.Vector3(1, 0, 0);
  var yy = new THREE.Vector3(0, 1, 0);
  var zz = new THREE.Vector3(0, 0, 1);
  var xxi = new THREE.Vector3(-1, 0, 0);
  var yyi = new THREE.Vector3(0, -1, 0);
  var zzi = new THREE.Vector3(0, 0, -1);

  var index_side = [ "U", "L", "F", "R", "B", "D" ];

  var sidesRot = {
    "U": axify(zz, yy, xxi),
    "L": axify(xx, zz, yyi),
    "F": axify(yyi, xx, zz),
    "R": axify(xx, zzi, yy),
    "B": axify(yy, xxi, zz),
    "D": axify(zzi, yy, xx)
  };
  var sidesNorm = {
    "U": yy,
    "L": xxi,
    "F": zz,
    "R": xx,
    "B": zzi,
    "D": yyi
  };
  var sidesRotAxis = {
    "U": yyi,
    "L": xx,
    "F": zzi,
    "R": xxi,
    "B": zz,
    "D": yy
  };
var sidesUV = [
               axify(xx, zzi, yy),
               axify(zz, yy, xxi),
               axify(xx, yy, zz),
               axify(zzi, yy, xx),
               axify(xxi, yy, zzi),
               axify(xx, zz, yyi)
               ];

var borderGeometry = new THREE.Geometry();
var c = cubeOptions.stickerWidth*0.51;
borderGeometry.vertices.push( new THREE.Vector3(-c, -c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(+c, -c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(+c, +c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(-c, +c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(-c, -c, 0) );
var borderMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: cubeOptions.borderWidth, opacity: cubeOptions.opacity});
var borderTemplate = new THREE.Line(borderGeometry, borderMaterial);

var innerGeometry = new THREE.PlaneGeometry(cubeOptions.stickerWidth, cubeOptions.stickerWidth);
var innerTemplate = new THREE.Mesh(innerGeometry);

var hintGeometry = innerGeometry.clone();
var hintTemplate = new THREE.Mesh(hintGeometry);
hintTemplate.rotateY(Math.PI);
hintTemplate.translateZ(-3);

var cubieTemplate = new THREE.Object3D();

var w = 2;
var cubieGeometry = new THREE.BoxGeometry(w, w, w);
var cubieMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 });
cubieMaterial.side = THREE.BackSide; // Hack to get around z-fighting.
var cubieTemplate1 = new THREE.Mesh(cubieGeometry, cubieMaterial);
cubieTemplate1.translateZ(-1);

cubieTemplate.add(cubieTemplate1);

var w = 1.9;
var cubieGeometry = new THREE.BoxGeometry(w, w, w);
var cubieMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 });
cubieMaterial.side = THREE.BackSide; // Hack to get around z-fighting.
var cubieTemplate1 = new THREE.Mesh(cubieGeometry, cubieMaterial);
cubieTemplate1.translateZ(-1);

cubieTemplate.add(cubieTemplate1);

var side = cubeOptions.doubleSided ? "doubleSided" : "singleSided";

//Cube Object Generation
for (var i = 0; i < numSides; i++) {
  var facePieces = [];
  cubePieces.push(facePieces);

  var stickerTemplate = new THREE.Object3D();

  var innerSticker = innerTemplate.clone();
  stickerTemplate.add(innerSticker);

  if (cubeOptions.hintStickers) {
    stickerTemplate.add(hintTemplate);
  }

  if (cubeOptions.stickerBorder) {
    stickerTemplate.add(borderTemplate);
  }

  if (cubeOptions.cubies) {
    // Easiest to make this one per sticker for now. Can be optimized later.
    stickerTemplate.add(cubieTemplate);
  }

  for (var su = 0; su < cubeOptions.dimension; su++) {
    for (var sv = 0; sv < cubeOptions.dimension; sv++) {

      if (isVoidCube &&
          (0 < su && su < cubeOptions.dimension - 1) &&
          (0 < sv && sv < cubeOptions.dimension - 1)
        ) {
        continue;
      }

      var sticker = stickerTemplate.clone();

      var material = materials[side][i+1];
      var material2 = materials.singleSided[i+1];

      if (cubeOptions.dimension == 3) {
        var material = materials[side][stickers[i][su + 3*sv]];
        var material2 = materials.singleSided[stickers[i][su + 3*sv]];
      }

      sticker.children[0].material = material;

      if (cubeOptions.hintStickers) {
        sticker.children[1].material = material2;
      }

      var positionMatrix = new THREE.Matrix4();
      positionMatrix.makeTranslation(
          su*2 - cubeOptions.dimension + 1,
          -(sv*2 - cubeOptions.dimension + 1),
          cubeOptions.dimension
      );

      var x = sidesUV[i].clone();
      x.multiplyMatrices(x, positionMatrix);

      sticker.applyMatrix(x);

      facePieces.push([x, sticker]);
      cubeObject.add(sticker);

      }
    }
  }

  function matrixVector3Dot(m, v) {
    return m.elements[12]*v.x + m.elements[13]*v.y + m.elements[14]*v.z;
  }

  var actualScale = 2 * cubeOptions.dimension / cubeOptions.scale;
  if (cubeOptions.hintStickers) {
    actualScale *= 1.2;
  }
  function cameraScale() {
    return actualScale;
  }

  var lastMoveProgress = 0;
  var animateMoveCallback = function(twisty, currentMove, moveProgress) {

    // Easing
    moveProgress = twisty.options.easing(moveProgress);

    var canonical = alg.cube.canonicalizeMove(currentMove, twisty.options.dimension);

    if (canonical.base == ".") {
      return; // Pause
    }

    var rott = new THREE.Matrix4();
    //rott.makeRotationAxis(sidesRotAxis[canonical.base], (moveProgress - lastMoveProgress) * canonical.amount * Math.PI/2);
    lastMoveProgress = moveProgress;
    rott.makeRotationAxis(sidesRotAxis[canonical.base], moveProgress * canonical.amount * Math.PI/2);

    var state = twisty.cubePieces;


    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        // Support negative layer indices (e.g. for rotations)
        //TODO: Bug 20110906, if negative index ends up the same as start index, the animation is iffy. 
        var layerStart = canonical.startLayer;
        var layerEnd = canonical.endLayer;
        if (layerEnd < 0) {
          layerEnd = twisty.options.dimension + 1 + layerEnd;
        }

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[canonical.base]);
        if (
            layer < twisty.options.dimension - 2*layerStart + 2.5
            &&
            layer > twisty.options.dimension - 2*layerEnd - 0.5
           ) {
             var roty = rott.clone();
             roty.multiply(sticker[0]);

             // console.log(sticker[1].position);
             // console.log(sticker[1].rotation);
             //  sticker[1].position.set(0,0,0);
             //  sticker[1].rotation.set(0,0,0);
             //  sticker[1].quaternion.set(0,0,0);
             sticker[1].matrix.copy(sticker[0]);
              sticker[1].applyMatrix(rott);
             // sticker[1].matrixAutoUpdate = false;
             // sticker[1].matrix = rott;
             // sticker[1].updateMatrix();
           }
      }
    }

  };

  function matrix4Power(inMatrix, power) {

    var matrix = null;
    if (power < 0) {
      matrix = new THREE.Matrix4();
      matrix.getInverse(inMatrix);
    } else {
      matrix = inMatrix.clone();
    }

    var out = new THREE.Matrix4();
    for (var i=0; i < Math.abs(power); i++) {
      out.multiply(matrix);
    }

    return out;

  }

  var cumulativeAlgorithm = [];

  var advanceMoveCallback = function(twisty, currentMove) {

    var canonical = alg.cube.canonicalizeMove(currentMove, twisty.options.dimension);

    if (canonical.base === ".") {
      return; // Pause
    }

    var rott = matrix4Power(sidesRot[canonical.base], canonical.amount);

    var state = twisty.cubePieces;

    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        var layerStart = canonical.startLayer;
        var layerEnd = canonical.endLayer;
        if (layerEnd < 0) {
          layerEnd = twisty.options.dimension + 1 + layerEnd;
        }

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[canonical.base]);
        if (
            layer < twisty.options.dimension - 2*layerStart + 2.5
            &&
            layer > twisty.options.dimension - 2*layerEnd - 0.5
           ) {
             var roty = rott.clone();
             roty.multiply(sticker[0]);

             sticker[1].matrix.identity();
             sticker[1].applyMatrix(roty);
             sticker[0].copy(roty);

           }
      }
    }

    cumulativeAlgorithm.push(canonical);
    if (twisty.options.algUpdateCallback) {
      twisty.options.algUpdateCallback(cumulativeAlgorithm);
    }
  };

  function generateScramble(twisty) {
    var dim = twisty.options.dimension;
    var n = 32;
    var newMoves = [];

    for (var i=0; i<n; i++) {

      var startLayer = 1+ Math.floor(Math.random()*dim/2);
      var endLayer = startLayer + Math.floor(Math.random()*dim/2);
      var side = Math.floor(Math.random()*6);
      var amount = [-2, -1, 1, 2][Math.floor(Math.random()*4)];

      var newMove = {
        type: "move",
        base: ["u", "l", "f", "r", "b", "d"][side],
        amount: amount,
        startLayer: startLayer,
        endLayer: endLayer
      };

      newMoves.push(newMove);

    }

    return newMoves;
  }

  var iS = 1;
  var oS = 1;
  var iSi = cubeOptions.dimension;
  var cubeKeyMapping = {
    73: "R", 75: "R'",
    87: "B", 79: "B'",
    83: "D", 76: "D'",
    68: "L", 69: "L'",
    74: "U", 70: "U'",
    72: "F", 71: "F'", // Heise
    78: "F", 86: "F'", //Kirjava

    67: "l", 82: "l'",
    85: "r", 77: "r'",

    84: "x", 89: "x", 66: "x'", // 84 (T) and 89 (Y) are alternatives.
    186: "y", 59: "y", 65: "y'", // 186 is WebKit, 59 is Mozilla; see http://unixpapa.com/js/key.html
    80: "z", 81: "z'",

    190: "M'",
  }
  var keydownCallback = function(twisty, e) {
    if(e.altKey || e.ctrlKey) {
      return null;
    }

    var keyCode = e.keyCode;
    if (keyCode in cubeKeyMapping) {
      var move = alg.cube.fromString(cubeKeyMapping[keyCode])[0];
      twistyScene.queueMoves(move);
      twistyScene.play.start();

      return move;
    }

    return null;
  };

  var ogCubePiecesCopy = [];
  for(var faceIndex = 0; faceIndex < cubePieces.length; faceIndex++) {
    var faceStickers = cubePieces[faceIndex];
    var ogFaceCopy = [];
    ogCubePiecesCopy.push(ogFaceCopy);
    for(var i = 0; i < faceStickers.length; i++) {
      ogFaceCopy.push(cubePieces[faceIndex][i][0].clone());
    }
  }
  function areMatricesEqual(m1, m2) {
    var flatM1 = m1.flattenToArrayOffset(new Array(16), 0);
    var flatM2 = m2.flattenToArrayOffset(new Array(16), 0);
    for (var i = 0; i < flatM1.length; i++) {
      if(flatM1[i] != flatM2[i]) {
        return false;
      }
    }
    return true;
  }
  var isSolved = function() {
    var state = cubePieces;
    var dimension = cubeOptions.dimension;


    // This implementation of isSolved simply checks that
    // all polygons have returned to their original locations.
    // There are 2 problems with this scheme:
    //  1. Re-orienting the cube makes every sticker look unsolved.
    //  2. A center is still solved even if it is rotated in place.
    //     This isn't a supercube!
    //
    // To deal with 1, we pick a sticker, and assume that it is solved.
    // We then derive what the necessary amount of rotation is to have
    // taken our solved cube and placed the sticker where it is now.
    //      netRotation * originalLocation = newLocation
    //      netRotation = newLocation * (1/originalLocation)
    // We then proceed to compare every sticker to netRotation*originalLocation.
    //
    // We deal with center stickers by apply all 4 rotations to the original location.
    // If any of them match the new location, then we consider the sticker solved.
    var faceIndex = 0;
    var stickerIndex = 0;
    var stickerState = state[faceIndex][stickerIndex][0];
    var netCubeRotations = new THREE.Matrix4();
    netCubeRotations.getInverse(ogCubePiecesCopy[faceIndex][stickerIndex]);
    netCubeRotations.multiplyMatrices(stickerState, netCubeRotations);

    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var currSticker = state[faceIndex][stickerIndex];
        var currState = currSticker[0];

        var i = Math.floor(stickerIndex / dimension);
        var j = stickerIndex % dimension;
        if(i > 0 && i < dimension - 1 && j > 0 && j < dimension - 1) {
          // Center stickers can still be solved even if they didn't make it
          // back to their original location (unless we're solving a supercube!)
          // We could skip the true centers on odd cubes, but I see no reason to do
          // so.
          var face = index_side[faceIndex];
          var rott = matrix4Power(sidesRot[face], 1);

          var rotatedOgState = ogCubePiecesCopy[faceIndex][stickerIndex].clone();
          var centerMatches = false;
          for(var i = 0; i < 4; i++) {
            var transformedRotatedOgState = new THREE.Matrix4();
            transformedRotatedOgState.multiplyMatrices(netCubeRotations, rotatedOgState);
            if(areMatricesEqual(currState, transformedRotatedOgState)) {
              centerMatches = true;
              break;
            }

            rotatedOgState.multiplyMatrices(rott, rotatedOgState);
          }
          if(!centerMatches) {
            return false;
          }
        } else {
          // Every non-center sticker should return to exactly where it was
          var ogState = new THREE.Matrix4();
          ogState.multiplyMatrices(netCubeRotations, ogCubePiecesCopy[faceIndex][stickerIndex]);
          if(!areMatricesEqual(currState, ogState)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  var isInspectionLegalMove = function(move) {
    if(["x", "y", "z"].indexOf(move.base) !== -1) {
      return true;
    }
    return false;
  };

  return {
    "type": twistyParameters,
    "options": cubeOptions,
    "3d": cubeObject,
    "cubePieces": cubePieces,
    "cameraScale": cameraScale,
    "animateMoveCallback": animateMoveCallback,
    "advanceMoveCallback": advanceMoveCallback,
    "keydownCallback": keydownCallback,
    "isSolved": isSolved,
    "isInspectionLegalMove": isInspectionLegalMove,
    "generateScramble": generateScramble
  };

}
