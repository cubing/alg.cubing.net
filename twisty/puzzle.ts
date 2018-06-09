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
  abstract equivalent(s1: State<Puzzle>, s2: State<Puzzle>): boolean
}

interface KSolvePuzzleState extends KSolve.Transformation, State<KSolvePuzzle> {
}

export class KSolvePuzzle extends Puzzle {
  constructor(private definition: KSolve.PuzzleDefinition) {
    super();
  }

  static fromID(id: string): KSolvePuzzle {
    return new KSolvePuzzle(KSolve.Puzzles[id]);
  }

  startState(): KSolvePuzzleState {
    return this.definition.startPieces;
  }
  invert(state: KSolvePuzzleState): KSolvePuzzleState {
    return KSolve.Invert(this.definition, state);
  }
  combine(s1: KSolvePuzzleState, s2: KSolvePuzzleState): KSolvePuzzleState {
    return KSolve.Combine(this.definition, s1, s2);
  }
  stateFromMove(moveName: MoveName): KSolvePuzzleState {
     var state = this.definition.moves[moveName];
     if (!state) {
       throw `Unknown move: ${moveName}`;
     }
     return state;
  }
  equivalent(s1: KSolvePuzzleState, s2: KSolvePuzzleState): boolean {
    return KSolve.EquivalentStates(this.definition, s1, s2);
  }
}

class QTMCounterState implements State<QTMCounterPuzzle> {
  constructor(public value: number) {}
}

export class QTMCounterPuzzle extends Puzzle {
  startState(): QTMCounterState {
    return new QTMCounterState(0);
  }
  invert(state: QTMCounterState): QTMCounterState {
    return new QTMCounterState(-state.value);
  }
  combine(s1: QTMCounterState, s2: QTMCounterState): QTMCounterState {
    return new QTMCounterState(s1.value + s2.value);
  }
  stateFromMove(moveName: MoveName): QTMCounterState {
    return new QTMCounterState(1);
  }
  equivalent(s1: QTMCounterState, s2: QTMCounterState): boolean {
    return s1.value === s2.value;
  }
}


}
