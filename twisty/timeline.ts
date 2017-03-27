"use strict";

namespace Twisty {

export namespace Timeline {

export enum BreakpointType {
  Move,
  EntireMoveSequence
}

// TODO: Extend `number`, introduce MoveSequenceTimestamp vs. EpochTimestamp,
// force Duration to be a difference.
export type Duration = number; // Duration in milliseconds
export type Timestamp = Duration; // Duration since a particular epoch.

export type Fraction = number; // Value from 0 to 1.

// TODO: Handle different types of breakpoints:
// - Move
// - Line
// - Start/end of move sequence.
// - "section" (e.g. scramble section, solve section)
export interface BreakpointModel {
  firstBreakpoint(): Duration;
  lastBreakpoint(): Duration;
  // TODO: Define semantics if `duration` is past the end.
  breakpoint(direction: Cursor.Direction, breakpointType: BreakpointType, duration: Duration): Duration;
}

export class SimpleBreakpoints implements BreakpointModel {
    // Assumes breakpointList is sorted.
    constructor(private breakpointList: Duration[]) {}

    firstBreakpoint() {
      return this.breakpointList[0];
    }
    lastBreakpoint() {
      return this.breakpointList[this.breakpointList.length - 1];
    }

    breakpoint(direction: Cursor.Direction, breakpointType: BreakpointType, duration: Duration) {
      if (direction === Cursor.Direction.Backwards) {
        var l = this.breakpointList.filter(d2 => d2 < duration);
        if (l.length === 0 || breakpointType === BreakpointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakpointType == EntireMoveSequence
          return this.firstBreakpoint();
        }
        return l[l.length - 1];
      } else {
        var l = this.breakpointList.filter(d2 => d2 > duration);
        if (l.length === 0 || breakpointType === BreakpointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakpointType == EntireMoveSequence
          return this.lastBreakpoint();
        }
        return l[0];
      }
    }
}

// TODO: Encapsulate
export class Position {
  constructor(public part: Alg.Algorithm, public dir: Cursor.Direction, public fraction: Fraction) {}
}

// TODO: Encapsulate
class PartWithDirection {
  constructor(public part: Alg.Algorithm, public direction: Cursor.Direction) {}
}

// TODO: Encapsulate
export class DirectionWithCursor {
  constructor(public dir: Cursor.Direction,
              public cursor: Timeline.Duration) {}
}

export class AlgPosition extends Alg.Traversal.DownUp<DirectionWithCursor, Position | null> {
  public cursor: Timeline.Duration = 0

  constructor(public algDuration = new Cursor.AlgDuration()) {
    super();
  }

  // TODO: Better name
  private leaf(algorithm: Alg.Algorithm, dirCur: DirectionWithCursor): Position | null {
    return new Position(algorithm, dirCur.dir, dirCur.cursor/ this.algDuration.traverse(algorithm));
  }

  private traversePartsWithDirections(partsWithDirections: PartWithDirection[], amount: number, dirCur: DirectionWithCursor): Position | null {
    // TODO: Use generators once TypeScript is less buggy with them.
    var iterList = dirCur.dir === Cursor.Direction.Forwards ?
                       partsWithDirections :
                       partsWithDirections.slice(0).reverse();

    var singleIterationTotal = 0;
    for (var partWithDirection of iterList) {
      // TODO: Dedup this calculation with the final loop?
      singleIterationTotal += this.algDuration.traverse(partWithDirection.part);
    }
    var numFullIterations = Math.floor(dirCur.cursor / singleIterationTotal);

    var cursorRemaining = dirCur.cursor - numFullIterations * singleIterationTotal;
    // TODO: Use division/interpolation to handle large amounts efficiently.
    for (var i = 0; i < amount; i++) {
      for (var partWithDirection of iterList) {
          var duration = this.algDuration.traverse(partWithDirection.part);
          // TODO: keep the move transition either on the rising edge or the falling edge, from the "forward" perspective.
          if (cursorRemaining <= duration) {
            var newDir = dirCur.dir * partWithDirection.direction; // TODO
            var newDirCur = new DirectionWithCursor(newDir, cursorRemaining);
            return this.traverse(partWithDirection.part, newDirCur);
          }
          cursorRemaining -= duration;
      }
    }
    return null;
  }

  public traverseSequence(sequence: Alg.Sequence, dirCur: DirectionWithCursor): Position | null {
    var p = sequence.nestedAlgs.map(part => new PartWithDirection(part, Cursor.Direction.Forwards));
    return this.traversePartsWithDirections(p, 1, dirCur);
  }
  public traverseGroup(group: Alg.Group, dirCur: DirectionWithCursor): Position | null {
    return this.traverse(group.nestedAlg, dirCur);}
  public traverseBlockMove(blockMove: Alg.BlockMove, dirCur: DirectionWithCursor): Position | null {
    return this.leaf(blockMove, dirCur); }
  public traverseCommutator(commutator: Alg.Commutator, dirCur: DirectionWithCursor): Position | null {
    return this.traversePartsWithDirections([
      new PartWithDirection(commutator.A, Cursor.Direction.Forwards),
      new PartWithDirection(commutator.B, Cursor.Direction.Forwards),
      new PartWithDirection(commutator.A, Cursor.Direction.Backwards),
      new PartWithDirection(commutator.B, Cursor.Direction.Backwards)
    ], commutator.amount, dirCur);
  }
  public traverseConjugate(conjugate: Alg.Conjugate, dirCur: DirectionWithCursor): Position | null {
    return this.traversePartsWithDirections([
      new PartWithDirection(conjugate.A, Cursor.Direction.Forwards),
      new PartWithDirection(conjugate.B, Cursor.Direction.Forwards),
      new PartWithDirection(conjugate.A, Cursor.Direction.Backwards)
    ], conjugate.amount, dirCur);
  }
  public traversePause(pause: Alg.Pause, dirCur: DirectionWithCursor): Position | null {
    return this.leaf(pause, dirCur); }
  public traverseNewLine(newLine: Alg.NewLine, dirCur: DirectionWithCursor): Position | null {
    return this.leaf(newLine, dirCur); }
  public traverseCommentShort(commentShort: Alg.CommentShort, dirCur: DirectionWithCursor): Position | null {
    return null; }
  public traverseCommentLong(commentLong: Alg.CommentLong, dirCur: DirectionWithCursor): Position | null {
    return null; }
}

}
// var t = new Timeline();
// t.alg = exampleAlg;
// console.log(t.breakpoint(Cursor.Direction.Forwards, Timeline.BreakpointType.Move, 10));
// console.log(t.breakpoint(Cursor.Direction.Backwards, Timeline.BreakpointType.Move, 10));
// console.log(t.breakpoint(Cursor.Direction.Backwards, Timeline.BreakpointType.Move, 1300));
// console.log(t.breakpoint(Cursor.Direction.Forwards, Timeline.BreakpointType.Move, 2050));
// console.log(t.breakpoint(Cursor.Direction.Backwards, Timeline.BreakpointType.Move, 2050));


}


