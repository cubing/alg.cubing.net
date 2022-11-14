"use strict";

namespace Twisty {

export class Cursor<P extends Puzzle> {
  private moves: Alg.Sequence;
  private durationFn: Alg.Traversal.Up<Cursor.Duration>;

  private state: State<P>;
  private moveIdx: number;
  private moveStartTimestamp: Cursor.Duration;
  private algTimestamp: Cursor.Duration;
  constructor(public alg: Alg.Algorithm, private puzzle: P) {
    this.setMoves(alg);
    this.setPositionToStart();

    this.durationFn = new Cursor.AlgDuration(Cursor.DefaultDurationForAmount)
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
    return this.durationFn.traverse(this.moves);
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
  private moveDuration(): Cursor.Duration {
    // TODO: Cache
    return this.durationFn.traverse(this.moves.nestedAlgs[this.moveIdx]);
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
        fraction: moveTS / this.durationFn.traverse(move)
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
    var remainingOffset = (this.algTimestamp - this.moveStartTimestamp) + duration;

    while (this.moveIdx < this.numMoves()) {
      var move = this.moves.nestedAlgs[this.moveIdx];
      if(!(move instanceof Alg.BlockMove)) {
        throw "TODO - only BlockMove supported";
      }
      var lengthOfMove = this.durationFn.traverse(move);
      if (remainingOffset < lengthOfMove) {
        this.algTimestamp = this.moveStartTimestamp + remainingOffset;
        return false;
      }
      this.state = this.puzzle.combine(
        this.state,
        this.puzzle.multiply(this.puzzle.stateFromMove(move.base), move.amount)
      );
      this.moveIdx += 1;
      this.moveStartTimestamp += lengthOfMove;
      this.algTimestamp = this.moveStartTimestamp;
      remainingOffset -= lengthOfMove;
      if (stopAtEndOfMove) {
        return (remainingOffset > 0);
      }
    }
    return true;
  }
  backward(duration: Cursor.Duration, stopAtStartOfMove: boolean): /* TODO: Remove this. Represents of move breakpoint was reachec. */ boolean {
    if (duration < 0) {
      throw "negative";
    }
    var remainingOffset = (this.algTimestamp - this.moveStartTimestamp) - duration;

    while (this.moveIdx >= 0) {
      if (remainingOffset >= 0) {
        this.algTimestamp = this.moveStartTimestamp + remainingOffset;
        return false;
      }
      if (stopAtStartOfMove || this.moveIdx === 0) {
        this.algTimestamp = this.moveStartTimestamp;
        return true; // TODO
      }

      var prevMove = this.moves.nestedAlgs[this.moveIdx - 1];
      if(!(prevMove instanceof Alg.BlockMove)) {
        throw "TODO - only BlockMove supported";
      }

      this.state = this.puzzle.combine(
        this.state,
        this.puzzle.multiply(this.puzzle.stateFromMove(prevMove.base), -prevMove.amount)
      );
      var lengthOfMove = this.durationFn.traverse(prevMove);
      this.moveIdx -= 1;
      this.moveStartTimestamp -= lengthOfMove;
      this.algTimestamp = this.moveStartTimestamp;
      remainingOffset += lengthOfMove;
    }
    return true;
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

  export enum BreakpointType {
    Move,
    EntireMoveSequence
  }

  export type DurationForAmount = (amount: number) => Duration;

  export function ConstantDurationForAmount(amount: number): Duration {
    return 1000;
  }

  export function DefaultDurationForAmount(amount: number): Duration {
    switch (Math.abs(amount)) {
      case 0:
        return 0;
      case 1:
        return 1000;
      case 2:
        return 1500;
      default:
        return 2000;
    }
  }

  export class AlgDuration extends Alg.Traversal.Up<Duration> {
    // TODO: Pass durationForAmount as Down type instead?
    constructor(public durationForAmount = DefaultDurationForAmount) {
      super()
    }

    public traverseSequence(sequence: Alg.Sequence):             Duration {
      var total = 0;
      for (var alg of sequence.nestedAlgs) {
        total += this.traverse(alg)
      }
      return total;
    }
    public traverseGroup(group: Alg.Group):                      Duration { return group.amount * this.traverse(group.nestedAlg); }
    public traverseBlockMove(blockMove: Alg.BlockMove):          Duration { return this.durationForAmount(blockMove.amount); }
    public traverseCommutator(commutator: Alg.Commutator):       Duration { return commutator.amount * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B)); }
    public traverseConjugate(conjugate: Alg.Conjugate):          Duration { return conjugate.amount * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B)); }
    public traversePause(pause: Alg.Pause):                      Duration { return this.durationForAmount(1); }
    public traverseNewLine(newLine: Alg.NewLine):                Duration { return this.durationForAmount(1); }
    public traverseCommentShort(commentShort: Alg.CommentShort): Duration { return this.durationForAmount(0); }
    public traverseCommentLong(commentLong: Alg.CommentLong):    Duration { return this.durationForAmount(0); }
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
