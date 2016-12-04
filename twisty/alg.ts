"use strict";

class Alg {
  // TODO: Make `moves` private and create a public interface.
  constructor(public moves: Alg.BlockMove[]) {}
  toString(): string {
    return this.moves.join(" ");
  }
}

// TODO: Support non-SiGN conventions (e.g. clock).
namespace Alg {

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

export interface Segment {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.
  repeatable(): boolean
}
export interface NestableSegment extends Segment {}
// TODO: Handle repeatability in a consistent way.

abstract class Repeatable implements Segment {
  public readonly abstract type: string
  // TODO: Make `amount` an optional argument in derived class constructors.
  repeatable(): boolean {
    return true;
  }
  constructor(public amount: number) {}
  protected repetitionSuffix(): string {
    var absAmount = Math.abs(this.amount);
    var s = "";
    if (absAmount !== 1) {
      s += String(absAmount)
    }
    if (absAmount !== this.amount) {
      s += "'"
    }
    return s;
  }
}

abstract class NonRepeatable implements Segment {
  public readonly abstract type: string
  repeatable(): boolean {
    return false;
  }
}

export class Sequence extends NonRepeatable {
  public type: string = "sequence";
  constructor(public segments: Segment[]) {
    super();
  }
  toString(): string {
    return this.segments.join(" ");
  }
}

// TODO: Prevent a NestedSequence immediately inside a NestedSequence.
export class NestedSequence extends NonRepeatable implements NestableSegment {
  public type: string = "nestedSequence";
  constructor(public segments: NestableSegment[]) {
    super();
  }
  toString(): string {
    return this.segments.join(" ");
  }
}

// Group is is like a NestedSequence, but is enclosed in parentheses when
// written.
export class Group extends Repeatable implements NestableSegment {
  public type: string = "group";
  constructor(public nested: NestedSequence, amount: number) {
    super(amount);
  }
  toString(): string {
    return "(" + this.nested + ")" + this.repetitionSuffix();
  }
}

export class BlockMove extends Repeatable implements NestableSegment {
  public type: string = "blockMove";
  // TODO: Typesafe layer types?
  public layer?: number;
  public startLayer?: number;
  public endLayer?: number;
  // TODO: Handle layers in constructor
  constructor(public base: BaseMove, amount: number) {
    super(amount);
  }
  toString(): string {
    return this.base + this.repetitionSuffix();
  }
  copy(): BlockMove {
    // TODO: Take into account layers.
    return new BlockMove(this.base, this.amount);
  }
}

export class Commutator extends Repeatable implements NestableSegment {
  public type: string = "commutator";
  constructor(public A: NestableSegment, public B: NestableSegment, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ", " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Conjugate extends Repeatable implements NestableSegment {
  public type: string = "conjugate";
  constructor(public A: NestableSegment, public B: NestableSegment, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ": " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Pause extends NonRepeatable implements NestableSegment {
  public type: string = "pause";
  constructor() {
    super();
  }
  toString(): string {
    // TODO: Coalesce repeated pauses.
    return ".";
  }
}

export class Newline extends NonRepeatable implements NestableSegment {
  public type: string = "newline";
  constructor() {
    super();
  }
  toString(): string {
    return "\n";
  }
}

export class CommentShort extends NonRepeatable implements NestableSegment {
  public type: string = "commentShort";
  constructor(public comment: string) {
    super();
  }
  toString(): string {
    // TODO: Sanitize `//`
    // TODO: Enforce being followed by a newline (or the end of the alg)?
    return "//" + this.comment;
  }
}

export class CommentLong extends NonRepeatable implements NestableSegment {
  public type: string = "commentLong";
  constructor(public comment: string) {
    super();
  }
  toString(): string {
    // TODO: Sanitize `*/`
    return "/*" + this.comment + "*/";
  }
}

// interface Transformation<Down, Up> {
//   blockMove(blockMove: BlockMove, down: Down): Up
//   group(group: Group, down: Down): Up
// }

export class Invert {
  public static invert(segment: NestableSegment): NestableSegment;
  public static invert(segment: Segment): Segment {
    // TODO: Use a direct look up using e.g. hashmap instead of sequential if-else.
         if (segment instanceof Sequence)       { return Invert.invertSequence(segment); }
    else if (segment instanceof NestedSequence) { return Invert.invertNestedSequence(segment); }
    else if (segment instanceof Group)          { return Invert.invertGroup(segment); }
    else if (segment instanceof BlockMove)      { return Invert.invertBlockMove(segment); }
    else if (segment instanceof Commutator)     { return Invert.invertCommutator(segment); }
    else if (segment instanceof Conjugate)      { return Invert.invertConjugate(segment); }
    else if (segment instanceof Pause)          { return Invert.invertPause(segment); }
    else if (segment instanceof Newline)        { return Invert.invertNewline(segment); }
    else if (segment instanceof CommentShort)   { return Invert.invertCommentShort(segment); }
    else if (segment instanceof CommentLong)    { return Invert.invertCommentLong(segment); }
    else {
      throw "Unknown type of segment";
    }
  }

  public static invertSequence(sequence: Sequence): Segment {
    return new Sequence(sequence.segments.reverse().map(Invert.invert));
  }
  public static invertNestedSequence(nestedSequence: NestedSequence): NestableSegment {
    return new NestedSequence(nestedSequence.segments.reverse().map(Invert.invert));
  }
  public static invertGroup(group: Group): NestableSegment {
    return group; // TODO
  }
  public static invertBlockMove(blockMove: BlockMove): NestableSegment {
    var b = blockMove.copy();
    b.amount *= -1;
    return b;
  }
  public static invertCommutator(commutator: Commutator): NestableSegment {
    return new Commutator(
      commutator.B,
      commutator.A,
      commutator.amount
    );
  }
  public static invertConjugate(conjugate: Conjugate): NestableSegment {
    return new Commutator(
      conjugate.A,
      Invert.invert(conjugate.B),
      conjugate.amount
    );
  }
  public static invertPause(pause: Pause): NestableSegment {
    return pause; // TODO
  }
  public static invertNewline(newline: Newline): NestableSegment {
    return newline; // TODO
  }
  public static invertCommentShort(commentShort: CommentShort): NestableSegment {
    return commentShort; // TODO
  }
  public static invertCommentLong(commentLong: CommentLong): NestableSegment {
    return commentLong; // TODO
  }
}


// TODO
// export class TimeStamp extends NonRepeatable implements Segment

export namespace Example {
export const Sune: Alg = new Alg([
      // TODO: Use proper constructor instead of type assertion.
      new BlockMove("R",  1),
      new BlockMove("U",  1),
      new BlockMove("R", -1),
      new BlockMove("U",  1),
      new BlockMove("R",  1),
      new BlockMove("U",  2),
      new BlockMove("R", -1)
    ]);

export const SuneSeq: Segment = new Sequence([
      // TODO: Use proper constructor instead of type assertion.
      new BlockMove("R",  1),
      new BlockMove("U",  1),
      new BlockMove("R", -1),
      new BlockMove("U",  1),
      new BlockMove("R",  1),
      new BlockMove("U",  2),
      new BlockMove("R", -1)
    ]);
}

}
