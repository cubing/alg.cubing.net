var s;

function algxController($scope) {
  $scope.puzzles = [
    {name:"2x2x2", type: "Cube"},
   $scope.puzzle =
    {name:"3x3x3", type: "Cube"},
    {name:"4x4x4", type: "Cube"}
  ];

  $scope.stages = [
   $scope.stage =
    {name:"Full", type: "Stage"},
    {name:"PLL", type: "Stage"},
    {name:"OLL", type: "Stage"},
    {name:"F2L", type: "Stage"}
  ];

  $scope.animtypes = [
   $scope.animtype =
    {name:"Algorithm", type: "Animation Type"},
    {name:"Solution", type: "Animation Type"},
    {name:"Reconstruction", type: "Animation Type"}
  ];

  $scope.schemes = [
   $scope.scheme =
    {name:"BOY", type: "Color Scheme", scheme: "grobyw", display: "BOY", custom: false},
    {name:"Japanese", type: "Color Scheme", scheme: "groybw", display: "Japanese", custom: false},
    {name:"Custom:", type: "Color Scheme", display: "", custom: true}
  ];
  $scope.custom_scheme = "grobyw";

  $scope.speed = 1;

  $scope.alg = "x y' // inspection\nF R D L F // cross\nU R U' R' d R' U R // 1st pair\ny U2' R' U' R // 2nd pair\nU L U' L' d R U' R' // 3rd pair\ny' U' R U R' U R U' R' // 4th pair (OLS)\nR2' U' R' U' R U R U R U' R U2' // PLL";
  $scope.setup = "D2 U' R2 U F2 D2 U' R2 U' B' L2 R' B' D2 U B2 L' D' R2";

  // For debugging.
  s = function() {
    return $scope;
  };
}