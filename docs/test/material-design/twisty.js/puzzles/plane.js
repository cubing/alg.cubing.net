/*
 * Something simple for fallback/testing.
 */
function createPlaneTwisty(twistyScene, twistyType) {

  log("Creating plane twisty.");

  var cubePieces = [];

  // var material = new THREE.MeshLambertMaterial({color: 0xFF8800});
  // var plane = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), material);
  // plane.rotation.x = Math.TAU/4;
  // plane.doubleSided = true;

  

  var geometry = new THREE.PlaneGeometry( 1, 1 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  var material = new THREE.MeshBasicMaterial( { color: 0xff0000, overdraw: 0.5 } );

  plane = new THREE.Mesh( geometry, material );

  var updateTwistyCallback = function(twisty) {
  };

  return {
    "type": twistyType,
    "3d": plane,
    "updateTwistyCallback": updateTwistyCallback,
    "keydownCallback": updateTwistyCallback
  };

}

twistyjs.twisties["plane"] = createPlaneTwisty;
