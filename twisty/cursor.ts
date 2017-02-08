"use strict";

namespace Twisty {

var algDuration = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);

export class Cursor<P extends Puzzle> {
  private expandedAlgSequence: Alg.Sequence;
  private algDuration: Cursor.Duration;

  private currentMove: Alg.Algorithm;
  private moveIdx: number;
  private moveStartTimestamp: Cursor.Duration;
  private moveDuration: Cursor.Duration;
  private direction: Cursor.Direction;
  private amountInDirection: Cursor.Duration;
  private position: Cursor.Position<P>;
  constructor(public alg: Alg.Algorithm, private puzzle: P) {
    var expandedAlg = alg.expand();
    if (expandedAlg instanceof Alg.Sequence) {
      this.expandedAlgSequence = expandedAlg
    } else {
      this.expandedAlgSequence = new Alg.Sequence([expandedAlg]);
    }
    this.algDuration = algDuration.traverse(alg);

    // TODO: Avoid assuming all base moves are block moves.
    if (this.expandedAlgSequence.nestedAlgs.length === 0) {
      throw "empty alg"
    }

    this.setPositionToStart();
  }

  setPositionToStart() {
    var currentMove = this.expandedAlgSequence.nestedAlgs[0];
    this.currentMove = currentMove;
    this.moveIdx = 0;
    this.moveStartTimestamp = 0;
    this.moveDuration = algDuration.traverse(currentMove);
    this.direction = Cursor.Direction.Forwards;
    this.amountInDirection = 0;
    this.position = {
      state: this.puzzle.startState(),
      moves: [{
        move: currentMove,
        direction: this.direction,
        fraction: this.amountInDirection/this.moveDuration
      }]
    }
  }

  setPositionToEnd() {
    this.setPositionToStart();
    this.forward(this.algDuration, false);
  }

  startOfAlg(): Cursor.Duration {
    return 0;
  }
  endOfAlg(): Cursor.Duration {
    return this.algDuration
  }
  startOfMove(): Cursor.Duration {
    if (this.position === null) {
      return 0; // TODO
    }
    return this.moveStartTimestamp;
  }
  endOfMove(): Cursor.Duration {
    if (this.position === null) {
      return 0; // TODO
    }
    return this.moveStartTimestamp + this.moveDuration;
  }
  currentPosition(): Cursor.Position<P> {
    return this.position;
  }
  currentTimestamp(): Cursor.Duration {
    return this.moveStartTimestamp + this.amountInDirection;
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
  forward(duration: Cursor.Duration, stopAtEndOfMove: boolean): /* TODO: Remove this. Represents of move breakpoint was reachec. */ boolean {
    if (this.position === null) {
      return false;
    }
    if (duration < 0) {
      throw "negative";
    }
    var remainingDuration = this.amountInDirection + duration;
    for (var i = this.moveIdx; i < this.expandedAlgSequence.nestedAlgs.length; i++) {
      var move = this.expandedAlgSequence.nestedAlgs[i];
      var lengthOfMove = algDuration.traverse(move);
      // console.log("forward",
      //   move,
      //   lengthOfMove,
      //   this.position,
      //   this.currentMoveIdx,
      //   this.currentMoveStartTimestamp
      // )
      if (lengthOfMove >= remainingDuration) {
        this.currentMove = move;
        this.moveDuration = lengthOfMove;
        this.amountInDirection = remainingDuration;
        return false;
      }
      if (stopAtEndOfMove) {
        this.currentMove = move;
        this.moveDuration = lengthOfMove;
        this.amountInDirection = lengthOfMove;
        return true;
      }
      this.moveIdx++;

      if(!(move instanceof Alg.BlockMove)) {
        throw "TODO - only BlockMove supported";
      }
      this.position.state = this.puzzle.combine(
        this.position.state,
        this.puzzle.multiply(this.puzzle.stateFromMove(move.base), move.amount)
      );
      this.moveStartTimestamp += lengthOfMove;
      remainingDuration -= lengthOfMove;
    }
    throw "Past end";
  }
  backward(duration: Cursor.Duration, stopAtStartOfMove: boolean): /* TODO: Remove this. Represents of move breakpoint was reachec. */ boolean {
    if (this.position === null) {
      return false;
    }
    if (duration < 0) {
      throw "negative";
    }
    var remainingDuration = this.moveDuration - this.amountInDirection + duration;
    for (var i = this.moveIdx; i >= 0; i++) {
      var move = this.expandedAlgSequence.nestedAlgs[i];
      var lengthOfMove = algDuration.traverse(move);
      if (lengthOfMove >= remainingDuration) {
        this.currentMove = move;
        this.moveDuration = lengthOfMove;
        this.amountInDirection = lengthOfMove - remainingDuration;
        return false;
      }
      if (stopAtStartOfMove) {
        this.currentMove = move;
        this.moveDuration = lengthOfMove;
        this.amountInDirection = 0;
        return true;
      }
      this.moveIdx--;

      var prevMove = this.expandedAlgSequence.nestedAlgs[this.moveIdx];
      if(!(prevMove instanceof Alg.BlockMove)) {
        throw "TODO - only BlockMove supported";
      }
      this.position.state = this.puzzle.combine(
        this.position.state,
        this.puzzle.multiply(this.puzzle.stateFromMove(prevMove.base), -prevMove.amount)
      );
      this.moveStartTimestamp -= lengthOfMove;
      remainingDuration -= lengthOfMove;
    }
    throw "Past end";
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
