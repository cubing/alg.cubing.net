"use strict";

namespace KSolve {
// TODO: Properly handle freezing

export class OrbitTransformation {
  permutation: number[]
  orientation: number[]
}
// TODO: Use a list instead of an object for performance?
export type Transformation = {
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

export class Puzzle {
  public state: Transformation
  constructor(public definition: PuzzleDefinition) {
    this.state = IdentityTransformation(definition);
  }

  private loc2idx(loc: number) {
    return loc - 1;
  }

  public applyMove(moveName: string): this {
    var move = this.definition.moves[moveName];
    if (!move) {
      throw `Unknown move: ${move}`
    }

    var newState: Transformation = <Transformation>{};
    for (var orbitName in this.definition.orbits) {
      var orbitDefinition = this.definition.orbits[orbitName];
      var oldStateTransformation = this.state[orbitName];
      var moveTransformation = move[orbitName];

      var newPermutation = new Array(orbitDefinition.numPieces);
      var newOrientation = new Array(orbitDefinition.numPieces);
      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        var prevIdx = this.loc2idx(moveTransformation.permutation[idx] as number);
        newPermutation[idx] = oldStateTransformation.permutation[prevIdx];

        var orientationChange = moveTransformation.orientation[idx];
        newOrientation[idx] = (oldStateTransformation.orientation[prevIdx] + orientationChange) % orbitDefinition.orientations;
      }
      newState[orbitName] = {permutation: newPermutation, orientation: newOrientation};
    }

    this.state = newState;
    return this;
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

  // TODO: Implement
  // parseState(): this {}

  // TODO: Alg parsing

  // TODO: Implement.
  // invert(): this {}
}

export class SVG {
  public element: HTMLElement; // TODO: SVGSVGElement?
  private originalColors: {[type: string]: string} = {}
  constructor(public puzzleDefinition: PuzzleDefinition) {
    if (!puzzleDefinition.svg) {
      throw `No SVG definition for puzzle type: ${puzzleDefinition.name}`
    }

    this.element = document.createElement("svg");
    // TODO: Sanitization.
    this.element.innerHTML = puzzleDefinition.svg;
    document.body.appendChild(this.element);

    for (var orbitName in puzzleDefinition.orbits) {
      var orbitDefinition = puzzleDefinition.orbits[orbitName];

      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, idx, orientation);
          this.originalColors[id] = this.elementByID(id).style.fill as string;
        }
      }
    }
  }

  private elementID(orbitName: string, idx: number, orientation: number): string {
    return orbitName + "-l" + idx + "-o" + orientation;
  }

  private elementByID(id: string): HTMLElement {
    // TODO: Use classes and scope selector to SVG element.
    return document.getElementById(id) as HTMLElement;
  }

  draw(puzzle: Puzzle) {
    for (var orbitName in puzzle.definition.orbits) {
      var orbitDefinition = puzzle.definition.orbits[orbitName];

      var orbitState = puzzle.state[orbitName];
      for (var idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (var orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          var id = this.elementID(orbitName, + idx, + orientation);
          var from = this.elementID(
            orbitName,
            orbitState.permutation[idx],
            (orbitDefinition.orientations - orbitState.orientation[idx] + orientation) % orbitDefinition.orientations
          );
          this.elementByID(id).style.fill = this.originalColors[from];
        }
      }
    }
  }
}

}
