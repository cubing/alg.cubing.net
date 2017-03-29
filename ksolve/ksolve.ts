"use strict";

namespace KSolve {
// TODO: Properly handle freezing

export class OrbitTransformation {
  permutation: number[]
  orientation: number[]
}
// TODO: Use a list instead of an object for performance?
export class Transformation {
  [/* orbit name */key: string]: OrbitTransformation
}

export class OrbitDefinition {
  numPieces: number
  orientations: number
}
export class PuzzleDefinition {
  name: string
  orbits: {[/* orbit name */key: string]: OrbitDefinition}
  startPieces: Transformation // TODO: Expose a way to get the transformed start pieces.
  moves: {[/* move name */key: string]: Transformation}
  svg?: string
}

export function Combine(def: PuzzleDefinition, t1: Transformation, t2: Transformation): Transformation {
  var newTrans: Transformation = <Transformation>{};
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o1 = t1[orbitName];
    var o2 = t2[orbitName];

    var newPerm = new Array(oDef.numPieces);
    var newOri = new Array(oDef.numPieces);
    for (var idx = 0; idx < oDef.numPieces; idx++) {
      // We subtract 1 to translate from location to index.
      var prevIdx = (o2.permutation[idx] as number) - 1;
      newPerm[idx] = o1.permutation[prevIdx];

      var orientationChange = o2.orientation[idx];
      newOri[idx] = (o1.orientation[prevIdx] + orientationChange) % oDef.orientations;
    }
    newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
  }

  return newTrans;
}

export function Multiply(def: PuzzleDefinition, t: Transformation, amount: number): Transformation {
  if (amount < 0) {
    return Multiply(def, Invert(def, t), -amount);
  }
  if (amount === 0) {
    return IdentityTransformation(def);
  }
  if (amount === 1) {
    return t;
  }
  var halfish = Multiply(def, t, Math.floor(amount/2));
  var twiceHalfish = Combine(def, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return Combine(def, t, twiceHalfish);
  }
}

export function IdentityTransformation(definition: PuzzleDefinition): Transformation {
  var transformation = <Transformation>{};
  for (var orbitName in definition.orbits) {
    var orbitDefinition = definition.orbits[orbitName];
    var newPermutation = new Array(orbitDefinition.numPieces);
    var newOrientation = new Array(orbitDefinition.numPieces);
    for (var i = 0; i < orbitDefinition.numPieces; i ++) {
      newPermutation[i] = i;
      newOrientation[i] = 0;
    }
    var orbitTransformation = {permutation: newPermutation, orientation: newOrientation};
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}

export function Invert(def: PuzzleDefinition, t: Transformation): Transformation {
  var newTrans: Transformation = <Transformation>{};
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o = t[orbitName];

    var newPerm = new Array(oDef.numPieces);
    var newOri = new Array(oDef.numPieces);
    for (var idx = 0; idx < oDef.numPieces; idx++) {
      var fromIdx = (o.permutation[idx] as number) - 1;
      newPerm[fromIdx] = idx + 1;
      newOri[fromIdx] = (oDef.orientations - o.orientation[idx]) % oDef.orientations;
    }
    newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
  }
  return newTrans;
}

export function EquivalentTransformations(def: PuzzleDefinition, t1: Transformation, t2: Transformation): boolean {
  for (var orbitName in def.orbits) {
    var oDef = def.orbits[orbitName];
    var o1 = t1[orbitName];
    var o2 = t2[orbitName];

    for (var idx = 0; idx < oDef.numPieces; idx++) {
      if (o1.orientation[idx] !== o2.orientation[idx]) {
        return false;
      }
      if (o1.permutation[idx] !== o2.permutation[idx]) {
        return false;
      }
    }
  }
  return true;
}

export function EquivalentStates(def: PuzzleDefinition, t1: Transformation, t2: Transformation): boolean {
  // Turn transformations into states.
  // This accounts for indistinguishable pieces.
  return EquivalentTransformations(
    def,
    Combine(def, def.startPieces, t1),
    Combine(def, def.startPieces, t2)
  );
}

export class Puzzle {
  public state: Transformation
  constructor(public definition: PuzzleDefinition) {
    this.state = IdentityTransformation(definition);
  }

  serialize(): string {
    var output = ""
    for (var orbitName in this.definition.orbits) {
      output += orbitName + "\n";
      output += this.state[orbitName].permutation.join(" ") + "\n";
      output += this.state[orbitName].orientation.join(" ") + "\n";
    }
    output = output.slice(0, output.length - 1); // Trim last newline.
    return output;
  }

  applyBlockMove(blockMove: Alg.BlockMove) {
    var move = this.definition.moves[blockMove.base];
    if (!move) {
      throw `Unknown move: ${blockMove.base}`
    }
    var multiple = Multiply(this.definition, move, blockMove.amount);
    this.state = Combine(this.definition, this.state, multiple);
  }

  applyMove(moveName: string): this {
    var move = this.definition.moves[moveName];
    if (!move) {
      throw `Unknown move: ${moveName}`
    }

    this.state = Combine(this.definition, this.state, move);
    return this;
  }

  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}

var xmlns = "http://www.w3.org/2000/svg";

export class SVG {
  public element: HTMLElement;
  public gradientDefs: SVGDefsElement;
  private originalColors: {[type: string]: string} = {}
  private gradients: {[type: string]: SVGGradientElement} = {}
  constructor(public puzzleDefinition: PuzzleDefinition) {
    if (!puzzleDefinition.svg) {
      throw `No SVG definition for puzzle type: ${puzzleDefinition.name}`
    }

    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    // TODO: Sanitization.
    this.element.innerHTML = puzzleDefinition.svg;
    document.body.appendChild(this.element);

    var svgElem = this.element.querySelector("svg");
    if (xmlns !== svgElem.namespaceURI) {
      throw "Unexpected XML namespace";
    }
    this.gradientDefs = <SVGDefsElement>document.createElementNS(xmlns, "defs");
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);

    for (var orbitName in puzzleDefinition.orbits) {
      var orbitDefinition = puzzleDefinition.orbits[orbitName];

      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, idx, orientation);
          var elem = this.elementByID(id);
          var originalColor = elem.style.fill as string;
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${id})`);
        }
      }
    }
  }

  private newGradient(id: string, originalColor: string): SVGGradientElement {
    var grad = <SVGGradientElement>document.createElementNS(xmlns, "radialGradient");
    grad.setAttribute("id", `grad-${id}`);
    grad.setAttribute("r", `70.7107%`); // TODO: Adapt to puzzle.
    var stopDefs = [
      {offset: 0, color: originalColor},
      {offset: 0, color: originalColor},
      {offset: 0, color: "black"},
      {offset: 0, color: "black"},
      {offset: 0, color: originalColor},
      {offset: 100, color: originalColor}
    ];
    for (var stopDef of stopDefs) {
      var stop = <SVGStopElement>document.createElementNS(xmlns,
        "stop");
      stop.setAttribute("offset", `${stopDef.offset}%`);
      stop.setAttribute("stop-color", stopDef.color);
      stop.setAttribute("stop-opacity", "1");
      grad.appendChild(stop);
    }
    return grad;
  }

  private elementID(orbitName: string, idx: number, orientation: number): string {
    return orbitName + "-l" + idx + "-o" + orientation;
  }

  private elementByID(id: string): HTMLElement {
    // TODO: Use classes and scope selector to SVG element.
    return this.element.querySelector("#" + id) as HTMLElement;
  }

  draw(definition: PuzzleDefinition, state: Transformation, nextState?: Transformation, fraction?: number) {
    for (var orbitName in definition.orbits) {
      var orbitDefinition = definition.orbits[orbitName];

      var curOrbitState = state[orbitName];
      var nextOrbitState = nextState ? (nextState as Transformation)[orbitName] : null;
      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, idx, orientation);
          var fromCur = this.elementID(
            orbitName,
            curOrbitState.permutation[idx] - 1,
            (orbitDefinition.orientations - curOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations
          );
          var singleColor = false;
          if (nextOrbitState) {
            var fromNext = this.elementID(
              orbitName,
              nextOrbitState.permutation[idx] - 1,
              (orbitDefinition.orientations - nextOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations
            );
            if (fromCur === fromNext) {
              singleColor = true; // TODO: Avoid redundant work during move.
            }
            var easedFraction = fraction * fraction * (2 - fraction * fraction); // TODO: Move easing up the stack.
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromNext]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromNext]);
            this.gradients[id].children[1].setAttribute("offset", `${Math.max(easedFraction*100 - 5, 0)}%`)
            this.gradients[id].children[2].setAttribute("offset", `${Math.max(easedFraction*100 - 5, 0)}%`)
            this.gradients[id].children[3].setAttribute("offset", `${easedFraction*100}%`)
            this.gradients[id].children[4].setAttribute("offset", `${easedFraction*100}%`)
            this.gradients[id].children[4].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[5].setAttribute("stop-color", this.originalColors[fromCur]);
          } else {
            singleColor = true; // TODO: Avoid redundant work during move.
          }
          if (singleColor) {
            this.gradients[id].children[1].setAttribute("offset", `0%`)
            this.gradients[id].children[2].setAttribute("offset", `0%`)
            this.gradients[id].children[3].setAttribute("offset", `0%`)
            this.gradients[id].children[4].setAttribute("offset", `0%`)
            this.gradients[id].children[4].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[5].setAttribute("stop-color", this.originalColors[fromCur]);
          }
          // this.gradients[id]
          // this.elementByID(id).style.fill = this.originalColors[from];
        }
      }
    }
  }
}

}
