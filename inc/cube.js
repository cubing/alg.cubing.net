/*
 * Rubik's Cube NxNxN
 */
function createCubeTwisty(twistyScene, twistyParameters) {

  log("Creating cube twisty.");

  // Cube Variables
  var cubeObject = new THREE.Object3D();
  var cubePieces = [];

  //Defaults
  var cubeOptions = {
    "stickerBorder": true,
    "cubies": false,
    "stickerWidth": 1.8,
    "doubleSided": true,
    "algUpdateCallback": null,
    "hintStickers": false,
    "opacity": 1,
    "dimension": 3,
    "colors": [0x444444, 0xffffff, 0xff8800, 0x00ff00, 0xff0000, 0x0000ff, 0xffff00,
    // TODO: Handle extra colors procedurally
               0x222222, 0xaaaaaa, 0x884400, 0x008800, 0x660000, 0x000088, 0x888800],
    "stage": "full",
    "scale": 1,
  };


  // Passed Parameters
  for (option in cubeOptions) {
    if(option in twistyParameters) {
      log("Setting option \"" + option + "\" to " + twistyParameters[option]);
      cubeOptions[option] = twistyParameters[option];
    }
  };

  // Cube Constants
  var numSides = 6;

  // Cube Materials
  var materials = {"singleSided": [], "doubleSided": []};
  for (var i = 0; i < cubeOptions["colors"].length; i++) {
    for (var j = 0; j < 2; j++) {
      var side = ["singleSided", "doubleSided"][j];
      var material = new THREE.MeshBasicMaterial( { color: cubeOptions["colors"][i], overdraw: 0.5 });
      if (side === "doubleSided") {
        material.side = THREE.DoubleSide;
      }
      material.opacity = cubeOptions["opacity"];
      materials[side].push(material);
    }
  }

  // Stickering for stages.
  var stageStickers = {};
  stageStickers["full"] = [
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6]
  ];
  stageStickers["PLL"] = [
    [1,1,1,1,1,1,1,1,1],
    [2,2,2,9,9,9,9,9,9],
    [3,3,3,10,10,10,10,10,10],
    [4,4,4,11,11,11,11,11,11],
    [5,5,5,12,12,12,12,12,12],
    [6,6,6,6,6,6,6,6,6]
  ];
  stageStickers["OLL"] = [
    [1,1,1,1,1,1,1,1,1],
    [0,0,0,9,9,9,9,9,9],
    [0,0,0,10,10,10,10,10,10],
    [0,0,0,11,11,11,11,11,11],
    [0,0,0,12,12,12,12,12,12],
    [6,6,6,6,6,6,6,6,6]
  ];
  stageStickers["F2L"] = [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,2,2,2,2,2,2],
    [0,0,0,3,3,3,3,3,3],
    [0,0,0,4,4,4,4,4,4],
    [0,0,0,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6]
  ];

  var stickers = stageStickers["full"];
  console.log("sdfsdf", cubeOptions["stage"] in stageStickers);
  if (cubeOptions["stage"] in stageStickers) {
    stickers = stageStickers[cubeOptions["stage"]];
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

  // var index_side = [ "U", "L", "F", "R", "B", "D" ];

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
var c = cubeOptions["stickerWidth"]*0.51;
borderGeometry.vertices.push( new THREE.Vector3(-c, -c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(+c, -c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(+c, +c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(-c, +c, 0) );
borderGeometry.vertices.push( new THREE.Vector3(-c, -c, 0) );
var borderMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 8, opacity: cubeOptions.opacity});
var borderTemplate = new THREE.Line(borderGeometry, borderMaterial);

var innerGeometry = new THREE.PlaneGeometry(cubeOptions["stickerWidth"], cubeOptions["stickerWidth"]);
var innerTemplate = new THREE.Mesh(innerGeometry);

var hintGeometry = innerGeometry.clone();
var hintTemplate = new THREE.Mesh(hintGeometry);
hintTemplate.rotateY(Math.TAU/2);
hintTemplate.translateZ(-3);

var w = 1.95;
var cubieGeometry = new THREE.CubeGeometry(w, w, w);
var cubieMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 });
cubieTemplate = new THREE.Mesh(cubieGeometry, cubieMaterial);
cubieTemplate.translateZ(-1);

var side = cubeOptions["doubleSided"] ? "doubleSided" : "singleSided";

//Cube Object Generation
for (var i = 0; i < numSides; i++) {
  var facePieces = [];
  cubePieces.push(facePieces);

  var stickerTemplate = new THREE.Object3D();

  var innerSticker = innerTemplate.clone();
  stickerTemplate.add(innerSticker);

  if (cubeOptions["hintStickers"]) {
    stickerTemplate.add(hintTemplate);
  }

  if (cubeOptions["stickerBorder"]) {
    stickerTemplate.add(borderTemplate);
  }

  if (cubeOptions["cubies"]) {
    // Easiest to make this one per sticker for now. Can be optimized later.
    stickerTemplate.add(cubieTemplate);
  }

  for (var su = 0; su < cubeOptions["dimension"]; su++) {
    for (var sv = 0; sv < cubeOptions["dimension"]; sv++) {

      sticker = stickerTemplate.clone();

      var material = materials[side][i+1];
      var material2 = materials["singleSided"][i+1];

      if (cubeOptions["dimension"] == 3) {
        var material = materials[side][stickers[i][su + 3*sv]];
        var material2 = materials["singleSided"][stickers[i][su + 3*sv]];
      }

      sticker.children[0].material = material;

      if (cubeOptions["hintStickers"]) {
        sticker.children[1].material = material2;
      }

      var positionMatrix = new THREE.Matrix4();
      positionMatrix.makeTranslation(
          su*2 - cubeOptions["dimension"] + 1,
          -(sv*2 - cubeOptions["dimension"] + 1),
          cubeOptions["dimension"]
      );

      var x = sidesUV[i].clone();
      x.multiply(positionMatrix);

      sticker.applyMatrix(x);

      facePieces.push([x, sticker]);
      cubeObject.add(sticker);

      }
    }
  }

  function matrixVector3Dot(m, v) {
    return m.elements[12]*v.x + m.elements[13]*v.y + m.elements[14]*v.z;
  }

  var actualScale = 2 * cubeOptions["dimension"] / cubeOptions["scale"];
  if (cubeOptions["hintStickers"]) {
    actualScale *= 1.2;
  }
  function cameraScale() {
    return actualScale;
  }

  var lastMoveProgress = 0;
  var animateMoveCallback = function(twisty, currentMove, moveProgress) {

    if (currentMove[2] == ".") {
      return; // Pause
    }

    var rott = new THREE.Matrix4();
    //rott.makeRotationAxis(sidesRotAxis[currentMove[2]], (moveProgress - lastMoveProgress) * currentMove[3] * Math.TAU/4);
    lastMoveProgress = moveProgress;
    rott.makeRotationAxis(sidesRotAxis[currentMove[2]], moveProgress * currentMove[3] * Math.TAU/4);

    var state = twisty["cubePieces"];


    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        // Support negative layer indices (e.g. for rotations)
        //TODO: Bug 20110906, if negative index ends up the same as start index, the animation is iffy. 
        var layerStart = currentMove[0];
        var layerEnd = currentMove[1];
        if (layerEnd < 0) {
          layerEnd = twisty["options"]["dimension"] + 1 + layerEnd;
        }

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[currentMove[2]]);
        if (
            layer < twisty["options"]["dimension"] - 2*layerStart + 2.5
            &&
            layer > twisty["options"]["dimension"] - 2*layerEnd - 0.5
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

    if (currentMove[2] === ".") {
      return; // Pause
    }

    var rott = matrix4Power(sidesRot[currentMove[2]], currentMove[3]);

    var state = twisty["cubePieces"];

    for (var faceIndex = 0; faceIndex < state.length; faceIndex++) {
      var faceStickers = state[faceIndex];
      for (var stickerIndex = 0; stickerIndex < faceStickers.length; stickerIndex++) {
        // TODO - sticker isn't really a good name for this --jfly
        var sticker = state[faceIndex][stickerIndex];

        var layerStart = currentMove[0];
        var layerEnd = currentMove[1];
        if (layerEnd < 0) {
          layerEnd = twisty["options"]["dimension"] + 1 + layerEnd;
        }

        var layer = matrixVector3Dot(sticker[1].matrix, sidesNorm[currentMove[2]]);
        if (
            layer < twisty["options"]["dimension"] - 2*layerStart + 2.5
            &&
            layer > twisty["options"]["dimension"] - 2*layerEnd - 0.5
           ) {
             var roty = rott.clone();
             roty.multiply(sticker[0]);

             sticker[1].matrix.identity();
             sticker[1].applyMatrix(roty);
             sticker[0].copy(roty);

           }
      }
    }

    cumulativeAlgorithm.push(currentMove);
    if (twisty["options"]["algUpdateCallback"]) {
      twisty["options"]["algUpdateCallback"](cumulativeAlgorithm);
    }
  };

  function generateScramble(twisty) {
    var dim = twisty["options"]["dimension"];
    var n = 32;
    var newMoves = [];

    for (var i=0; i<n; i++) {

      var random1 = 1+ Math.floor(Math.random()*dim/2);
      var random2 = random1 + Math.floor(Math.random()*dim/2);
      var random3 = Math.floor(Math.random()*6);
      var random4 = [-2, -1, 1, 2][Math.floor(Math.random()*4)];

      var newMove = [random1, random2, ["U", "L", "F", "R", "B", "D"][random3], random4];

      newMoves.push(newMove);

    }

    return newMoves;
  }

  var iS = 1;
  var oS = 1;
  var iSi = cubeOptions["dimension"];
  var cubeKeyMapping = {
    73: [iS, oS, "R", 1],
    75: [iS, oS, "R", -1],
    87: [iS, oS, "B", 1],
    79: [iS, oS, "B", -1],
    83: [iS, oS, "D", 1],
    76: [iS, oS, "D", -1],
    68: [iS, oS, "L", 1],
    69: [iS, oS, "L", -1],
    74: [iS, oS, "U", 1],
    70: [iS, oS, "U", -1],
    72: [iS, oS, "F", 1],
    71: [iS, oS, "F", -1],
    186: [iS, iSi, "U", 1],//y
    59: [iS, iSi, "U", 1],//y (TODO - why is this needed for firefox?)
    65: [iS, iSi, "U", -1],//y'
    85: [iS, oS+1, "R", 1],
    82: [iS, oS+1, "L", -1],
    77: [iS, oS+1, "R", -1],
    86: [iS, oS, "F", -1],
    84: [iS, iSi, "L", -1],
    89: [iS, iSi, "R", 1],
    78: [iS, oS, "F", 1],
    66: [iS, iSi, "L", 1],
    190: [2, 2, "R", 1],//M'
    80: [iS, iSi, "F", 1],//y
    81: [iS, iSi, "F", -1],//y'
  }
  var keydownCallback = function(twisty, e) {
    if(e.altKey || e.ctrlKey) {
      return;
    }

    var keyCode = e.keyCode;
    if (keyCode in cubeKeyMapping) {
      twistyScene.addMoves([cubeKeyMapping[keyCode]]);
    }
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
    var flatM1 = m1.flatten();
    var flatM2 = m2.flatten();
    for (var i = 0; i < flatM1.length; i++) {
      if(flatM1[i] != flatM2[i]) {
        return false;
      }
    }
    return true;
  }
  var isSolved = function(twisty) {
    var state = twisty.cubePieces;
    var dimension = twisty["options"]["dimension"];


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
    netCubeRotations = netCubeRotations.multiply(stickerState, netCubeRotations);

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
            transformedRotatedOgState = ogState.multiply(netCubeRotations, rotatedOgState);
            if(areMatricesEqual(currState, transformedRotatedOgState)) {
              centerMatches = true;
              break;
            }

            rotatedOgState.multiply(rott, rotatedOgState);
          }
          if(!centerMatches) {
            return false;
          }
        } else {
          // Every non-center sticker should return to exactly where it was
          var ogState = new THREE.Matrix4();
          ogState = ogState.multiply(netCubeRotations, ogCubePiecesCopy[faceIndex][stickerIndex]);
          if(!areMatricesEqual(currState, ogState)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  var isInspectionLegalMove = function(twisty, move) {
    if(move[0] == 1 && move[1] == twisty["options"]["dimension"]) {
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

twistyjs.registerTwisty("cube", createCubeTwisty);
