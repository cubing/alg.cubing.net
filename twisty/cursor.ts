"use strict";

namespace Twisty {

var algDuration = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);


export class Cursor<P extends Puzzle> {
  private moves: Alg.Sequence;

  private state: State<P>;
  private moveIdx: number;
  private moveStartTimestamp: Cursor.Duration;
  private algTimestamp: Cursor.Duration;
  constructor(public alg: Alg.Algorithm, private puzzle: P) {
    this.setMoves(alg);
    this.setPositionToStart();
  }

  private setMoves(alg: Alg.Algorithm) {
    var moves = alg.expand();
    if (moves instanceof Alg.Sequence) {
      this.moves = moves
    } else {
      this.moves = new Alg.Sequence([moves]);
    }

    if (this.moves.nestedAlgs.length === 0) {
      throw "empty alg"
    }
    // TODO: Avoid assuming all base moves are block moves.
  }

  private algDuration() {
    // TODO: Cache internally once performance matters.
    return algDuration.traverse(this.moves);
  }

  private numMoves() {
    // TODO: Cache internally once performance matters.
    return this.moves.countBlockMoves();
  }

  setPositionToStart() {
    this.moveIdx = 0;
    this.moveStartTimestamp = 0;
    this.algTimestamp = 0;
    this.state = this.puzzle.startState();
  }

  setPositionToEnd() {
    this.setPositionToStart();
    this.forward(this.algDuration(), false);
  }

  startOfAlg(): Cursor.Duration {
    return 0;
  }
  endOfAlg(): Cursor.Duration {
    return this.algDuration();
  }
  // startOfMove(): Cursor.Duration {
  //   return this.moveStartTimestamp;
  // }
  // endOfMove(): Cursor.Duration {
  //   if (this.algTimestamp >= this.algDuration) {
  //     return this.algTimestamp;
  //   }
  //   return this.moveStartTimestamp + this.moveDuration();
  // }
  private moveDuration(): Cursor.Duration {
    // TODO: Cache
    return algDuration.traverse(this.moves.nestedAlgs[this.moveIdx]);
  }
  currentPosition(): Cursor.Position<P> {
    var pos = <Cursor.Position<P>>{
      state: this.state,
      moves: []
    }
    var move = this.moves.nestedAlgs[this.moveIdx];
    var moveTS = this.algTimestamp - this.moveStartTimestamp;
    if (moveTS !== 0) {
      pos.moves.push({
        move: move,
        direction: Cursor.Direction.Forwards,
        fraction: moveTS / algDuration.traverse(move)
      });
    }
    return pos;
  }
  currentTimestamp(): Cursor.Duration {
    return this.algTimestamp;
  }
  delta(duration: Cursor.Duration, stopAtMoveBoundary: boolean): boolean {
    // TODO: Unify forward and backward?
    if (duration > 0) {
      return this.forward(duration, stopAtMoveBoundary);
    } else {
      return this.backward(-duration, stopAtMoveBoundary);
    }
  }

  // TODO: Avoid assuming a single move at a time.
  forward(duration: Cursor.Duration, stopAtEndOfMove: boolean): /* TODO: Remove this. Represents if move breakpoint was reached. */ boolean {
    if (duration < 0) {
      throw "negative";
    }
    var remainingDuration = (this.algTimestamp - this.moveStartTimestamp) + duration;

    while (this.moveIdx < this.numMoves()) {
      var move = this.moves.nestedAlgs[this.moveIdx];
      if(!(move instanceof Alg.BlockMove)) {
        throw "TODO - only BlockMove supported";
      }
      var lengthOfMove = algDuration.traverse(move);
      if (remainingDuration < lengthOfMove) {
        this.algTimestamp = this.moveStartTimestamp + remainingDuration;
        return false;
      }
      this.state = this.puzzle.combine(
        this.state,
        this.puzzle.multiply(this.puzzle.stateFromMove(move.base), move.amount)
      );
      this.moveIdx += 1;
      this.moveStartTimestamp += lengthOfMove;
      this.algTimestamp = this.moveStartTimestamp;
      remainingDuration -= lengthOfMove;
      if (stopAtEndOfMove) {
        return (remainingDuration > 0);
      }
    }
    // if (remainingDuration > 0) {
    //   throw "Past end";
    // }
    return false
  }
  backward(duration: Cursor.Duration, stopAtStartOfMove: boolean): /* TODO: Remove this. Represents of move breakpoint was reachec. */ boolean {
    return false;
  //   if (this.position === null) {
  //     return false;
  //   }
  //   if (duration < 0) {
  //     throw "negative";
  //   }
  //   var remainingDuration = this.moveDuration - this.amountInDirection + duration;
  //   for (var i = this.moveIdx; i >= 0; i++) {
  //     var move = this.moves.nestedAlgs[i];
  //     var lengthOfMove = algDuration.traverse(move);
  //     if (lengthOfMove >= remainingDuration) {
  //       this.currentMove = move;
  //       this.moveDuration = lengthOfMove;
  //       this.amountInDirection = lengthOfMove - remainingDuration;
  //       return false;
  //     }
  //     if (stopAtStartOfMove) {
  //       this.currentMove = move;
  //       this.moveDuration = lengthOfMove;
  //       this.amountInDirection = 0;
  //       return true;
  //     }
  //     this.moveIdx--;

  //     var prevMove = this.moves.nestedAlgs[this.moveIdx];
  //     if(!(prevMove instanceof Alg.BlockMove)) {
  //       throw "TODO - only BlockMove supported";
  //     }
  //     this.position.state = this.puzzle.combine(
  //       this.position.state,
  //       this.puzzle.multiply(this.puzzle.stateFromMove(prevMove.base), -prevMove.amount)
  //     );
  //     this.moveStartTimestamp -= lengthOfMove;
  //     remainingDuration -= lengthOfMove;
  //   }
  //   throw "Past end";
  }
}

export namespace Cursor {
  export type Duration = number; // Duration in milliseconds
  // TODO: Extend `number`, introduce MoveSequenceTimestamp vs. EpochTimestamp,
  // force Duration to be a difference.
  export type Timestamp = Duration; // Duration since a particular epoch.

  export type Fraction = number; // Value from 0 to 1.

  export enum Direction {
    Forwards = 1,
    Paused = 0,
    Backwards = -1
  }

  export interface MoveProgress {
    move: Alg.Algorithm
    direction: Direction
    fraction: number
  }

  export type Position<P extends Puzzle> = {
    state: State<P>
    moves: MoveProgress[]
  }
}

// var c = new Cursor(Alg.Example.APermCompact);
// console.log(c.currentPosition());
// c.forward(4321, false);
// console.log(c.currentPosition());
// c.forward(2000, false);
// console.log(c.currentPosition());
// c.backward(100, false);
// console.log(c.currentPosition());
// c.backward(1800, false);
// console.log(c.currentPosition());
// c.forward(605, false);
// console.log(c.currentPosition());
// c.forward(10000, true);
// console.log(c.currentPosition());


// abstract class Position<AlgType extends Alg.Algorithm> {
//   Alg: AlgType;
//   Direction: Timeline.Direction;
//   TimeToSubAlg: Timeline.Duration;
//   SubAlg: Alg.Algorithm | null;
// }

}
