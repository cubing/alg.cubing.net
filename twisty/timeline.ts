"use strict";

namespace Twisty {

export class Timeline implements Timeline.BreakpointModel {
  constructor(public alg: Alg.Algorithm) {
  }

  firstBreakpoint(): Timeline.Duration {
    return 0;
  }

  lastBreakpoint(): Timeline.Duration {
    // TODO: Bind once to Timeline namespace.
    var durFn = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);
    return durFn.traverse(this.alg);
  }

  // TODO: Define semantics if `duration` is past the end.
  breakpoint(direction: Timeline.Direction, breakpointType: Timeline.BreakpointType, duration: Timeline.Duration): Timeline.Duration {
    if (breakpointType === Timeline.BreakpointType.EntireMoveSequence) {
      if (direction === Timeline.Direction.Backwards) {
        return this.firstBreakpoint();
      } else {
        return this.lastBreakpoint();
      }
    }

    // TODO: Bind once to Timeline namespace.
    var durFn = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);
    var posFn = new Timeline.AlgPosition(durFn);
    var dirCur = new Timeline.DirectionWithCursor(Timeline.Direction.Forwards, duration);
    var pos = posFn.traverse(this.alg, dirCur);
    if (pos === null) {
      throw "Invalid position calculated." // TODO
    }
    // TODO: Make this less hacky.
    if (direction === Timeline.Direction.Forwards && duration < this.lastBreakpoint()) {
      if (pos.fraction === 1) {
        return this.breakpoint(direction, breakpointType, duration + 0.1);
      }
    }
    // TODO: Make sure that AlgPosition returns the right move.
    if (direction === Timeline.Direction.Backwards && duration > this.firstBreakpoint()) {
      if (pos.fraction === 0) {
        return this.breakpoint(direction, breakpointType, duration - 0.1);
      }
    }

    // TODO: Make this less hacky.
    var frac = pos.fraction;
    if (pos.dir === Timeline.Direction.Backwards) {
      frac = 1 - pos.fraction
    }
    if (pos.dir === direction) {
      return duration + pos.dir * durFn.traverse(pos.part) * (1 - frac);
    } else {
      return duration - pos.dir * durFn.traverse(pos.part) * frac;
    }
  }
}

export namespace Timeline {

// The values are animation scaling factors.
// TODO: "Paused" is more of an Anim concept. Can we get it out of the Timeline
// namespace in a natural way?
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1
}

export function CombineDirections(d1: Direction, d2: Direction): Direction {
  return d1 * d2;
}

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
  breakpoint(direction: Direction, breakpointType: BreakpointType, duration: Duration): Duration;
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

    breakpoint(direction: Direction, breakpointType: BreakpointType, duration: Duration) {
      if (direction === Direction.Backwards) {
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

export class AlgDuration extends Alg.Traversal.Up<Timeline.Duration> {
  // TODO: Pass durationForAmount as Down type instead?
  constructor(public durationForAmount = DefaultDurationForAmount) {
    super()
  }

  public traverseSequence(sequence: Alg.Sequence):             Timeline.Duration {
    var total = 0;
    for (var alg of sequence.nestedAlgs) {
      total += this.traverse(alg)
    }
    return total;
  }
  public traverseGroup(group: Alg.Group):                      Timeline.Duration { return group.amount * this.traverse(group.nestedAlg); }
  public traverseBlockMove(blockMove: Alg.BlockMove):          Timeline.Duration { return this.durationForAmount(blockMove.amount); }
  public traverseCommutator(commutator: Alg.Commutator):       Timeline.Duration { return commutator.amount * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B)); }
  public traverseConjugate(conjugate: Alg.Conjugate):          Timeline.Duration { return conjugate.amount * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B)); }
  public traversePause(pause: Alg.Pause):                      Timeline.Duration { return this.durationForAmount(1); }
  public traverseNewLine(newLine: Alg.NewLine):                Timeline.Duration { return this.durationForAmount(1); }
  public traverseCommentShort(commentShort: Alg.CommentShort): Timeline.Duration { return this.durationForAmount(0); }
  public traverseCommentLong(commentLong: Alg.CommentLong):    Timeline.Duration { return this.durationForAmount(0); }
}

// TODO: Encapsulate
export class Position {
  constructor(public part: Alg.Algorithm, public dir: Timeline.Direction, public fraction: Fraction) {}
}

// TODO: Encapsulate
class PartWithDirection {
  constructor(public part: Alg.Algorithm, public direction: Timeline.Direction) {}
}

// TODO: Encapsulate
export class DirectionWithCursor {
  constructor(public dir: Timeline.Direction,
              public cursor: Timeline.Duration) {}
}

export class AlgPosition extends Alg.Traversal.DownUp<DirectionWithCursor, Position | null> {
  public cursor: Timeline.Duration = 0

  constructor(public algDuration = new AlgDuration()) {
    super();
  }

  // TODO: Better name
  private leaf(algorithm: Alg.Algorithm, dirCur: DirectionWithCursor): Position | null {
    return new Position(algorithm, dirCur.dir, dirCur.cursor/ this.algDuration.traverse(algorithm));
  }

  private traversePartsWithDirections(partsWithDirections: PartWithDirection[], amount: number, dirCur: DirectionWithCursor): Position | null {
    // TODO: Use generators once TypeScript is less buggy with them.
    var iterList = dirCur.dir === Timeline.Direction.Forwards ?
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
            var newDir = Timeline.CombineDirections(dirCur.dir, partWithDirection.direction);
            var newDirCur = new DirectionWithCursor(newDir, cursorRemaining);
            return this.traverse(partWithDirection.part, newDirCur);
          }
          cursorRemaining -= duration;
      }
    }
    return null;
  }

  public traverseSequence(sequence: Alg.Sequence, dirCur: DirectionWithCursor): Position | null {
    var p = sequence.nestedAlgs.map(part => new PartWithDirection(part, Timeline.Direction.Forwards));
    return this.traversePartsWithDirections(p, 1, dirCur);
  }
  public traverseGroup(group: Alg.Group, dirCur: DirectionWithCursor): Position | null {
    return this.traverse(group.nestedAlg, dirCur);}
  public traverseBlockMove(blockMove: Alg.BlockMove, dirCur: DirectionWithCursor): Position | null {
    return this.leaf(blockMove, dirCur); }
  public traverseCommutator(commutator: Alg.Commutator, dirCur: DirectionWithCursor): Position | null {
    return this.traversePartsWithDirections([
      new PartWithDirection(commutator.A, Timeline.Direction.Forwards),
      new PartWithDirection(commutator.B, Timeline.Direction.Forwards),
      new PartWithDirection(commutator.A, Timeline.Direction.Backwards),
      new PartWithDirection(commutator.B, Timeline.Direction.Backwards)
    ], commutator.amount, dirCur);
  }
  public traverseConjugate(conjugate: Alg.Conjugate, dirCur: DirectionWithCursor): Position | null {
    return this.traversePartsWithDirections([
      new PartWithDirection(conjugate.A, Timeline.Direction.Forwards),
      new PartWithDirection(conjugate.B, Timeline.Direction.Forwards),
      new PartWithDirection(conjugate.A, Timeline.Direction.Backwards)
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

export type DurationForAmount = (amount: number) => Timeline.Duration;

export function ConstantDurationForAmount(amount: number): Timeline.Duration {
  return 1000;
}

export function DefaultDurationForAmount(amount: number): Timeline.Duration {
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

}
// var t = new Timeline();
// t.alg = exampleAlg;
// console.log(t.breakpoint(Timeline.Direction.Forwards, Timeline.BreakpointType.Move, 10));
// console.log(t.breakpoint(Timeline.Direction.Backwards, Timeline.BreakpointType.Move, 10));
// console.log(t.breakpoint(Timeline.Direction.Backwards, Timeline.BreakpointType.Move, 1300));
// console.log(t.breakpoint(Timeline.Direction.Forwards, Timeline.BreakpointType.Move, 2050));
// console.log(t.breakpoint(Timeline.Direction.Backwards, Timeline.BreakpointType.Move, 2050));


var durFn = new Timeline.AlgDuration(Timeline.DefaultDurationForAmount);
var posFn = new Timeline.AlgPosition(durFn);
var dirCur = new Timeline.DirectionWithCursor(Timeline.Direction.Backwards, 14000);
}


