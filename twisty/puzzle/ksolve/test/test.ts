"use strict";

// Hacky, yet effective.
function ksolveTest(description: string, condition: boolean) {
  var li = document.createElement("li");
  if (condition) {
    console.log("\u2705 " + description);
    li.textContent = "\u2705 " + description;
  } else {
    console.error("\u274C " + description);
    li.textContent = "\u274C " + description;
  }
  document.write(new XMLSerializer().serializeToString(li));
}


(function Test222() {
   var Cube2 =  new KSolve.PuzzleDefinition(
    "222",
    new Map([["CORNERS", new KSolve.OrbitDefinition(7, 3)]]),
    new Map([["CORNERS", new KSolve.OrbitTransformation(
      [1, 2, 3, 4, 5, 6, 7],
      [0, 0, 0, 0, 0, 0, 0]
    )]]),
    new Map([
      ["U", new Map([["CORNERS", new KSolve.OrbitTransformation(
        [4, 1, 2, 3, 5, 6, 7],
        [0, 0, 0, 0, 0, 0, 0]
      )]])],
      ["R", new Map([["CORNERS", new KSolve.OrbitTransformation(
        [1, 3, 6, 4, 2, 5, 7],
        [0, 2, 1, 0, 1, 2, 0]
      )]])],
      ["F", new Map([["CORNERS", new KSolve.OrbitTransformation(
        [1, 2, 4, 7, 5, 3, 6],
        [0, 0, 2, 1, 0, 1, 2]
      )]])]
    ]),
);

  var p = new KSolve.Puzzle(Cube2);

  ksolveTest("Solved state", p.serialize() === "CORNERS\n0 1 2 3 4 5 6\n0 0 0 0 0 0 0");
  for (var move of "RURRRURUURRR") {
    p.applyMove(move);
  }
  ksolveTest("After Sune", p.serialize() === "CORNERS\n2 3 0 1 4 5 6\n2 0 2 2 0 0 0");
})();