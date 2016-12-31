
namespace KSolve {
// TODO: Handle solved states with non-ordered/repeated values.
// TODO: Properly handle freezing

export type OrbitName = string
export class OrbitDefinition {
  constructor(
    public numPieces: number,
    public orientations: number
  ) {}
}

export class OrbitTransformation {
  constructor(
    public permutation: number[],
    public orientation: number[]
  ) {}
}
// TODO: Use a list instead of a map for performance?
export class Transformation extends Map<OrbitName, OrbitTransformation> {}

export type PuzzleName = string
export type MoveName = string
export class PuzzleDefinition {
  constructor(
    public name: PuzzleName,
    public orbits: Map<OrbitName, OrbitDefinition>,
    public startPieces: Transformation,
    public moves: Map<MoveName, Transformation>
  ) {}
}

export function IdentityTransformation(definition: PuzzleDefinition): Transformation {
  var transformation = new Transformation();
  for (var [orbitName, orbitDefinition] of this.definition.orbits) {
    var newPermutation = new Array(orbitDefinition.numPieces);
    var newOrientation = new Array(orbitDefinition.numPieces);
    for (var i = 0; i < orbitDefinition.numPieces; i ++) {
      newPermutation.push(i);
      newOrientation.push(0);
    }
    var orbitTransformation = new OrbitTransformation(newPermutation, newOrientation);
    transformation.set(orbitName, orbitTransformation);
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

  private idx2loc(idx: number) {
    return idx + 1;
  }

  public applyMove(moveName: MoveName): void {
    var move = this.definition.moves.get(moveName);
    if (!move) {
      throw `Unknown move: ${move}`
    }

    // TODO: Figure out why `new Transformation()` causes a compiler error.
    var newState: Transformation = new Transformation();
    for (var [orbitName, orbitDefinition] of this.definition.orbits) {
      var oldStateTransformation = this.state.get(orbitName) as OrbitTransformation;
      var moveTransformation = move.get(orbitName) as OrbitTransformation;

      var newPermutation = new Array(orbitDefinition.numPieces);
      var newOrientation = new Array(orbitDefinition.numPieces);
      for (var idx = 0; idx <= orbitDefinition.numPieces; idx++) {
        var prevIdx = this.loc2idx(moveTransformation.permutation[idx] as number);
        newPermutation[idx] = oldStateTransformation.permutation[this.loc2idx(prevIdx)];

        var orientationChange = moveTransformation.orientation[idx];
        newOrientation[idx] = (oldStateTransformation.orientation[prevIdx] + orientationChange) % orbitDefinition.orientations;
      }
      newState.set(orbitName, new OrbitTransformation(newPermutation, newOrientation));
    }

    this.state = newState;
  }

  // ksolvePuzzle.prototype = {
  //   newSolvedState_: function() {
  //     var state = {};
  //     for (var orbit in this.parser_.orbits) {
  //       state[orbit] = {
  //         permutation: [],
  //         orientation: []
  //       };
  //       for (var i = 0; i < this.parser_.orbits[orbit].num; i++) {
  //         state[orbit].permutation.push(this.parser_.solved[orbit].permutation[i] - 1);
  //       }
  //       for (var i = 0; i < this.parser_.orbits[orbit].num; i++) {
  //         state[orbit].orientation.push(0);
  //       }
  //     }
  //     return state;
  //   },

  //   getState: function() {
  //     return this.state_;
  //   },

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

  //   // invertState: {},

  //   serializeStateToKsolve: function() {
  //     var output = ""
  //     for (var orbit in this.parser_.orbits) {
  //       output += orbit + "\n";
  //       // output += this.state_[orbit].permutation.map(function(x) {return x + 1;}).join(" ") + "\n";
  //       output += this.state_[orbit].permutation.join(" ") + "\n";
  //       output += this.state_[orbit].orientation.join(" ") + "\n";
  //     }
  //     output = output.slice(0, output.length - 1); // Trim last newline.
  //     return output;
  //   },

  //   printState: function() {
  //     console.log(this.serializeStateToKsolve());
  //   },

  //   applyAlg: function(algString) {
  //     var a = alg.cube.fromString(algString);
  //     for (var i in a) {
  //       var amount = (a[i].amount + 4) % 4;
  //       for (var j = 0; j < amount; j++) {
  //         this.applyMove(a[i].base);
  //       }
  //     }
  //   }
  // }
}

}