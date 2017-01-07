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

(function TestDraw() {
  var p = new KSolve.Puzzle(KSolve.Puzzles["222"]);
  var svg = new KSolve.SVG(KSolve.Puzzles["222"]);
  document.body.appendChild(svg.element);

  for (var move of "RURRRURUURRR") {
    p.applyMove(move);
  }
  svg.draw(p);
})();
