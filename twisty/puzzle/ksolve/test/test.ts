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

var Cube2 = {
  name: "222",
  orbits: {"CORNERS": {numPieces: 7, orientations: 3}},
  startPieces: {"CORNERS": {permutation: [1, 2, 3, 4, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0]}},
  moves: {
    "U": {"CORNERS": {permutation: [4, 1, 2, 3, 5, 6, 7], orientation: [0, 0, 0, 0, 0, 0, 0]}},
    "R": {"CORNERS": {permutation: [1, 3, 6, 4, 2, 5, 7], orientation: [0, 2, 1, 0, 1, 2, 0]}},
    "F": {"CORNERS": {permutation: [1, 2,4 , 7, 5, 3, 6], orientation: [0, 0, 0, 0, 0, 0, 0]}}
  },
  svg: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.0//EN\"\n       \"http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"490\" height=\"370\">\n  <defs>\n  </defs>\n  <title>222</title>\n  <defs>\n    <g id=\"sticker\">\n        <rect x=\"0\" y=\"0\" width=\"1\" height=\"1\" stroke=\"black\" stroke-width=\"0.04px\" />\n    </g>\n  </defs>\n  <g id=\"puzzle\" transform=\"translate(5, 5) scale(60)\">\n    <use id=\"CORNERS-l0-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 0)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l0-o1\" xlink:href=\"#sticker\" transform=\"translate(7, 2)\" style=\"fill: blue\"/>\n    <use id=\"CORNERS-l0-o2\" xlink:href=\"#sticker\" transform=\"translate(0, 2)\" style=\"fill: orange\"/>\n\n    <use id=\"CORNERS-l1-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 0)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l1-o1\" xlink:href=\"#sticker\" transform=\"translate(5, 2)\" style=\"fill: red\"/>\n    <use id=\"CORNERS-l1-o2\" xlink:href=\"#sticker\" transform=\"translate(6, 2)\" style=\"fill: blue\"/>\n\n    <use id=\"CORNERS-l2-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 1)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l2-o1\" xlink:href=\"#sticker\" transform=\"translate(3, 2)\" style=\"fill: green\"/>\n    <use id=\"CORNERS-l2-o2\" xlink:href=\"#sticker\" transform=\"translate(4, 2)\" style=\"fill: red\"/>\n\n    <use id=\"CORNERS-l3-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 1)\" style=\"fill: white\"/>\n    <use id=\"CORNERS-l3-o1\" xlink:href=\"#sticker\" transform=\"translate(1, 2)\" style=\"fill: orange\"/>\n    <use id=\"CORNERS-l3-o2\" xlink:href=\"#sticker\" transform=\"translate(2, 2)\" style=\"fill: green\"/>\n\n    <use id=\"CORNERS-l4-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 5)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l4-o1\" xlink:href=\"#sticker\" transform=\"translate(6, 3)\" style=\"fill: blue\"/>\n    <use id=\"CORNERS-l4-o2\" xlink:href=\"#sticker\" transform=\"translate(5, 3)\" style=\"fill: red\"/>\n\n    <use id=\"CORNERS-l5-o0\" xlink:href=\"#sticker\" transform=\"translate(3, 4)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l5-o1\" xlink:href=\"#sticker\" transform=\"translate(4, 3)\" style=\"fill: red\"/>\n    <use id=\"CORNERS-l5-o2\" xlink:href=\"#sticker\" transform=\"translate(3, 3)\" style=\"fill: green\"/>\n\n    <use id=\"CORNERS-l6-o0\" xlink:href=\"#sticker\" transform=\"translate(2, 4)\" style=\"fill: yellow\"/>\n    <use id=\"CORNERS-l6-o1\" xlink:href=\"#sticker\" transform=\"translate(2, 3)\" style=\"fill: green\"/>\n    <use id=\"CORNERS-l6-o2\" xlink:href=\"#sticker\" transform=\"translate(1, 3)\" style=\"fill: orange\"/>\n\n    <use                    xlink:href=\"#sticker\" transform=\"translate(2, 5)\" style=\"fill: yellow\"/>\n    <use                    xlink:href=\"#sticker\" transform=\"translate(0, 3)\" style=\"fill: orange\"/>\n    <use                    xlink:href=\"#sticker\" transform=\"translate(7, 3)\" style=\"fill: blue\"/>\n  </g>\n\n</svg>"
};


(function Test222() {
  var p = new KSolve.Puzzle(Cube2);

  ksolveTest("Solved state", p.serialize() === "CORNERS\n0 1 2 3 4 5 6\n0 0 0 0 0 0 0");
  for (var move of "RURRRURUURRR") {
    p.applyMove(move);
  }
  ksolveTest("After Sune", p.serialize() === "CORNERS\n2 3 0 1 4 5 6\n2 0 2 2 0 0 0");
})();

(function TestDraw() {
  var p = new KSolve.Puzzle(Cube2);
  var svg = new KSolve.SVG(Cube2);
  document.body.appendChild(svg.element);

  for (var move of "RURRRURUURRR") {
    p.applyMove(move);
  }
  svg.draw(p);
})();
