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
  var p = new KSolve.Puzzle(KSolve.Puzzles["222"]);

  ksolveTest("Solved state", p.serialize() === "CORNERS\n0 1 2 3 4 5 6\n0 0 0 0 0 0 0");
  for (var move of "RURRRURUURRR") {
    p.applyMove(move);
  }
  ksolveTest("After Sune", p.serialize() === "CORNERS\n2 3 0 1 4 5 6\n2 0 2 2 0 0 0");
})();

(function TestApplyBlockMove() {
  var p = new KSolve.Puzzle(KSolve.Puzzles["333"]);

  p.applyBlockMove(new Alg.BlockMove("R", 6));
  ksolveTest("After R6", p.serialize() === "CORNERS\n7 1 2 4 3 5 6 0\n0 0 0 0 0 0 0 0\nEDGES\n0 1 2 11 7 5 6 4 8 9 10 3\n0 0 0 0 0 0 0 0 0 0 0 0");
})();

(function TestDraw() {
  var p = new KSolve.Puzzle(KSolve.Puzzles["222"]);
})();
