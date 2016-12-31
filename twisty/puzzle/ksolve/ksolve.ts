
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

class SVG {
  //   orbitSVGElement: function(svgElement) {
  //     this.svgElement_ = svgElement;
  //     this.originalColors_ = {};

  //     for (var orbit in this.parser_.orbits) {
  //       var num_pieces = this.parser_.orbits[orbit].num;
  //       var num_orientations = this.parser_.orbits[orbit].orientations;

  //       for (var loc = 0; loc < num_pieces; loc++) {
  //         for (var orientations = 0; orientations < num_orientations; orientations++) {
  //           var id = orbit + "-l" + loc + "-o" + orientations;
  //           this.originalColors_[id] = this.svgElement_.getElementById(id).style.fill;
  //         }
  //       }
  //     }
  //   },

  //   draw: function() {
  //     for (var orbit in this.parser_.orbits) {
  //       for (var loc = 0; loc < this.parser_.orbits[orbit].num; loc++) {
  //         for (var orientations = 0; orientations < this.parser_.orbits[orbit].orientations; orientations++) {
  //           var id = orbit + "-l" + loc + "-o" + orientations;
  //           var from = orbit + "-l" + this.state_[orbit].permutation[loc] + "-o" + ((this.parser_.orbits[orbit].orientations - this.state_[orbit].orientation[loc] + orientations) % this.parser_.orbits[orbit].orientations);
  //           this.svgElement_.getElementById(id).style.fill = this.originalColors_[from];
  //         }
  //       }
  //     }
  //   },
}

}