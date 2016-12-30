
namespace KSolve {
// TODO: Handle solved states with non-ordered/repeated values.
// TODO: Properly handle freezing

export type SetName = string
export class SetDefinition {
  constructor(
    public numPieces: number,
    public orientations: number
  ) {}
}

export class SetTransformation {
  constructor(
    public permutation: number[],
    public orientation: number[]
  ) {}
}
export type Transformation = Map<SetName, SetTransformation>

export type PuzzleName = string
export type MoveName = string
export class PuzzleDefinition {
  constructor(
    public name: PuzzleName,
    public sets: Map<SetName, SetDefinition>,
    public startPieces: Transformation,
    public moves: Map<MoveName, Transformation>
  ) {}
}

export function IdentityTransformation(definition: PuzzleDefinition): Transformation {
  var transformation = new Map<MoveName, SetTransformation>();
  for (var [setName, setDefinition] of this.definition.sets) {
    var newPermutation = new Array(setDefinition.numPieces);
    var newOrientation = new Array(setDefinition.numPieces);
    for (var i = 0; i < setDefinition.numPieces; i ++) {
      newPermutation.push(i);
      newOrientation.push(0);
    }
    var setTransformation = new SetTransformation(newPermutation, newOrientation);
    transformation.set(setName, setTransformation);
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
    var newState: Transformation = new Map<SetName, SetTransformation>();
    for (var [setName, setDefinition] of this.definition.sets) {
      var oldStateTransformation = this.state.get(setName) as SetTransformation;
      var moveTransformation = move.get(setName) as SetTransformation;

      var newPermutation = new Array(setDefinition.numPieces);
      var newOrientation = new Array(setDefinition.numPieces);
      for (var idx = 0; idx <= setDefinition.numPieces; idx++) {
        var prevIdx = this.loc2idx(moveTransformation.permutation[idx] as number);
        newPermutation[idx] = oldStateTransformation.permutation[this.loc2idx(prevIdx)];

        var orientationChange = moveTransformation.orientation[idx];
        newOrientation[idx] = (oldStateTransformation.orientation[prevIdx] + orientationChange) % setDefinition.orientations;
      }
      newState.set(setName, new SetTransformation(newPermutation, newOrientation));
    }

    this.state = newState;
  }

  // ksolvePuzzle.prototype = {
  //   newSolvedState_: function() {
  //     var state = {};
  //     for (var set in this.parser_.sets) {
  //       state[set] = {
  //         permutation: [],
  //         orientation: []
  //       };
  //       for (var i = 0; i < this.parser_.sets[set].num; i++) {
  //         state[set].permutation.push(this.parser_.solved[set].permutation[i] - 1);
  //       }
  //       for (var i = 0; i < this.parser_.sets[set].num; i++) {
  //         state[set].orientation.push(0);
  //       }
  //     }
  //     return state;
  //   },

  //   getState: function() {
  //     return this.state_;
  //   },

  //   setSVGElement: function(svgElement) {
  //     this.svgElement_ = svgElement;
  //     this.originalColors_ = {};

  //     for (var set in this.parser_.sets) {
  //       var num_pieces = this.parser_.sets[set].num;
  //       var num_orientations = this.parser_.sets[set].orientations;

  //       for (var loc = 0; loc < num_pieces; loc++) {
  //         for (var orientations = 0; orientations < num_orientations; orientations++) {
  //           var id = set + "-l" + loc + "-o" + orientations;
  //           this.originalColors_[id] = this.svgElement_.getElementById(id).style.fill;
  //         }
  //       }
  //     }
  //   },

  //   draw: function() {
  //     for (var set in this.parser_.sets) {
  //       for (var loc = 0; loc < this.parser_.sets[set].num; loc++) {
  //         for (var orientations = 0; orientations < this.parser_.sets[set].orientations; orientations++) {
  //           var id = set + "-l" + loc + "-o" + orientations;
  //           var from = set + "-l" + this.state_[set].permutation[loc] + "-o" + ((this.parser_.sets[set].orientations - this.state_[set].orientation[loc] + orientations) % this.parser_.sets[set].orientations);
  //           this.svgElement_.getElementById(id).style.fill = this.originalColors_[from];
  //         }
  //       }
  //     }
  //   },

  //   // invertState: {},

  //   serializeStateToKsolve: function() {
  //     var output = ""
  //     for (var set in this.parser_.sets) {
  //       output += set + "\n";
  //       // output += this.state_[set].permutation.map(function(x) {return x + 1;}).join(" ") + "\n";
  //       output += this.state_[set].permutation.join(" ") + "\n";
  //       output += this.state_[set].orientation.join(" ") + "\n";
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