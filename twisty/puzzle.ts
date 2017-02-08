"use strict";

namespace Twisty {

export type MoveName = string

export interface MoveProgress {
  moveName: MoveName
  fraction: number
}

export interface State<Puzzle> {
}

export abstract class Puzzle {
  abstract startState(): State<Puzzle>
  abstract invert(state: State<Puzzle>): State<Puzzle>
  abstract combine(s1: State<Puzzle>, s2: State<Puzzle>): State<Puzzle>
  multiply(state: State<Puzzle>, amount: number): State<Puzzle> {
    if (amount < 0) {
      return this.invert(this.multiply(state, -amount));
    }

    var newState = this.startState();
    for(var i = 0; i < amount; i++) {
      newState = this.combine(newState, state);
    }
    return newState;
  }
  abstract stateFromMove(moveName: MoveName): State<Puzzle>
}

interface KSolve333PuzzleState extends KSolve.Transformation, State<KSolve333Puzzle> {
}

var threeDef = KSolve.Puzzles["333"];
export class KSolve333Puzzle extends Puzzle {
  startState(): KSolve333PuzzleState {
    return threeDef.startPieces;
  }
  invert(state: KSolve333PuzzleState): KSolve333PuzzleState {
    return KSolve.Invert(threeDef, state);
  }
  combine(s1: KSolve333PuzzleState, s2: KSolve333PuzzleState): KSolve333PuzzleState {
    return KSolve.Combine(threeDef, s1, s2);
  }
  stateFromMove(moveName: MoveName): KSolve333PuzzleState {
     var state = threeDef.moves[moveName];
     if (!state) {
       throw `Unknown move: ${moveName}`;
     }
     return state;
  }
}

}
