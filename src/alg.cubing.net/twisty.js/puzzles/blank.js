/*
 * Blank twisty. More useful as a template.
 */
function createBlankTwisty(twistyScene, twistyType) {

  log("Creating cube twisty.");

  var blankObject = new THREE.Object3D();

  var updateTwistyCallback = function(twisty) {
  };

  return {
    "type": twistyType,
      "3d": blankObject,
      "updateTwistyCallback": updateTwistyCallback
  };

}

twistyjs.registerTwisty("blank", createBlankTwisty);
