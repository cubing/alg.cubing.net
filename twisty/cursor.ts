"use strict";

namespace Twisty {

var algDuration = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);

export class Cursor {
  private expandedAlgSequence: Alg.Sequence;
  private algDuration: Cursor.Duration;

  private position: Cursor.Position;
  constructor(public alg: Alg.Algorithm) {
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
    this.position = {
      move: currentMove,
      moveIdx: 0,
      moveStartTimestamp: 0,
      moveDuration: algDuration.traverse(currentMove),
      direction: Cursor.Direction.Forwards,
      amountInDirection: 0
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
    return this.position.moveStartTimestamp;
  }
  endOfMove(): Cursor.Duration {
    if (this.position === null) {
      return 0; // TODO
    }
    return this.position.moveStartTimestamp + this.position.moveDuration;
  }
  currentPosition(): Cursor.Position {
    return this.position;
  }
  currentTimestamp(): Cursor.Duration {
    return this.position.moveStartTimestamp + this.position.amountInDirection;
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
    var remainingDuration = this.position.amountInDirection + duration;
    for (var i = this.position.moveIdx; i < this.expandedAlgSequence.nestedAlgs.length; i++) {
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
        this.position.move = move;
        this.position.moveDuration = lengthOfMove;
        this.position.amountInDirection = remainingDuration;
        return false;
      }
      if (stopAtEndOfMove) {
        this.position.move = move;
        this.position.moveDuration = lengthOfMove;
        this.position.amountInDirection = lengthOfMove;
        return true;
      }
      this.position.moveIdx++;
      this.position.moveStartTimestamp += lengthOfMove;
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
    var remainingDuration = this.position.moveDuration - this.position.amountInDirection + duration;
    for (var i = this.position.moveIdx; i >= 0; i++) {
      var move = this.expandedAlgSequence.nestedAlgs[i];
      var lengthOfMove = algDuration.traverse(move);
      if (lengthOfMove >= remainingDuration) {
        this.position.move = move;
        this.position.moveDuration = lengthOfMove;
        this.position.amountInDirection = lengthOfMove - remainingDuration;
        return false;
      }
      if (stopAtStartOfMove) {
        this.position.move = move;
        this.position.moveDuration = lengthOfMove;
        this.position.amountInDirection = 0;
        return true;
      }
      this.position.moveIdx--;
      this.position.moveStartTimestamp -= lengthOfMove;
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

  export type Position = {
    move: Alg.Algorithm // TODO: Define Alg.BasicAlg for leaf alg types?
    moveIdx: number,
    moveStartTimestamp: Cursor.Duration,
    moveDuration: Cursor.Duration
    direction: Direction
    amountInDirection: Duration
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