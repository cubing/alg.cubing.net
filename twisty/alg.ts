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

export interface AlgPart {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.
  repeatable(): boolean
}

export type Algorithm = AlgPart;

abstract class Repeatable implements AlgPart {
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

abstract class NonRepeatable implements AlgPart {
  public readonly abstract type: string
  repeatable(): boolean {
    return false;
  }
}

export class Sequence extends NonRepeatable {
  public type: string = "sequence";
  constructor(public algParts: AlgPart[]) {
    super();
  }
  toString(): string {
    return this.algParts.join(" ");
  }
}

// Group is is like a Sequence, but is enclosed in parentheses when
// written.
export class Group extends Repeatable implements AlgPart {
  public type: string = "group";
  constructor(public algPart: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "(" + this.algPart + ")" + this.repetitionSuffix();
  }
}

export class BlockMove extends Repeatable implements AlgPart {
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

export class Commutator extends Repeatable implements AlgPart {
  public type: string = "commutator";
  constructor(public A: AlgPart, public B: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ", " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Conjugate extends Repeatable implements AlgPart {
  public type: string = "conjugate";
  constructor(public A: AlgPart, public B: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ": " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Pause extends NonRepeatable implements AlgPart {
  public type: string = "pause";
  constructor() {
    super();
  }
  toString(): string {
    // TODO: Coalesce repeated pauses.
    return ".";
  }
}

export class Newline extends NonRepeatable implements AlgPart {
  public type: string = "newline";
  constructor() {
    super();
  }
  toString(): string {
    return "\n";
  }
}

export class CommentShort extends NonRepeatable implements AlgPart {
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

export class CommentLong extends NonRepeatable implements AlgPart {
  public type: string = "commentLong";
  constructor(public comment: string) {
    super();
  }
  toString(): string {
    // TODO: Sanitize `*/`
    return "/*" + this.comment + "*/";
  }
}

export namespace Transformation {

export abstract class DownUp<DataDown, DataUp> {
  public transform(segment: AlgPart, dataDown: DataDown): DataUp {
    return this.transformGeneric(segment, dataDown);
  }

  protected transformGeneric(segment: AlgPart, dataDown: DataDown): DataUp {
    // TODO: Use a direct look up using e.g. hashmap instead of sequential if-else.
    // TODO: Clone arguments by default, for safety.
         if (segment instanceof Sequence)       { return this.transformSequence(segment, dataDown); }
    else if (segment instanceof Group)          { return this.transformGroup(segment, dataDown); }
    else if (segment instanceof BlockMove)      { return this.transformBlockMove(segment, dataDown); }
    else if (segment instanceof Commutator)     { return this.transformCommutator(segment, dataDown); }
    else if (segment instanceof Conjugate)      { return this.transformConjugate(segment, dataDown); }
    else if (segment instanceof Pause)          { return this.transformPause(segment, dataDown); }
    else if (segment instanceof Newline)        { return this.transformNewline(segment, dataDown); }
    else if (segment instanceof CommentShort)   { return this.transformCommentShort(segment, dataDown); }
    else if (segment instanceof CommentLong)    { return this.transformCommentLong(segment, dataDown); }
    else {
      throw "Unknown type of segment";
    }
  }

  protected abstract transformSequence(sequence: Sequence, dataDown: DataDown): DataUp;
  protected abstract transformGroup(group: Group, dataDown: DataDown): DataUp;
  protected abstract transformBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp;
  protected abstract transformCommutator(commutator: Commutator, dataDown: DataDown): DataUp;
  protected abstract transformConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp;
  protected abstract transformPause(pause: Pause, dataDown: DataDown): DataUp;
  protected abstract transformNewline(newline: Newline, dataDown: DataDown): DataUp;
  protected abstract transformCommentShort(commentShort: CommentShort, dataDown: DataDown): DataUp;
  protected abstract transformCommentLong(commentLong: CommentLong, dataDown: DataDown): DataUp;
}

export abstract class Up<DataUp> extends DownUp<undefined, DataUp> {
  public transform(segment: AlgPart): DataUp {
    return this.transformGeneric.call(this, segment);
  }

  protected abstract transformSequence(sequence: Sequence): DataUp;
  protected abstract transformGroup(group: Group): DataUp;
  protected abstract transformBlockMove(blockMove: BlockMove): DataUp;
  protected abstract transformCommutator(commutator: Commutator): DataUp;
  protected abstract transformConjugate(conjugate: Conjugate): DataUp;
  protected abstract transformPause(pause: Pause): DataUp;
  protected abstract transformNewline(newline: Newline): DataUp;
  protected abstract transformCommentShort(commentShort: CommentShort): DataUp;
  protected abstract transformCommentLong(commentLong: CommentLong): DataUp;
};
export abstract class OfAlgPart extends Up<AlgPart> {};

// TODO: Test that inverses are bijections.
export abstract class Invert extends OfAlgPart {
  public transformSequence(sequence: Sequence): Sequence {
    // TODO: Handle newlines and comments correctly
    var inverseParts: AlgPart[] = [];
    for (var i = sequence.algParts.length - 1; i >= 0; i--) {
      inverseParts.push(this.transform(sequence.algParts[i]));
    }
    return new Sequence(inverseParts);
  }
  protected transformGroup(group: Group): AlgPart {
    return new Group(this.transform(group.algPart), group.amount);
  }
  protected transformBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  protected transformCommutator(commutator: Commutator): AlgPart {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }
  protected transformConjugate(conjugate: Conjugate): AlgPart {
    return new Conjugate(conjugate.A, this.transform(conjugate.B), conjugate.amount);
  }
  protected transformPause(pause: Pause): AlgPart {
    return new Pause();
  }
  protected transformNewline(newline: Newline): AlgPart {
    return new Newline();
  }
  protected transformCommentShort(commentShort: CommentShort): AlgPart {
    return new CommentShort(commentShort.comment);
  }
  protected transformCommentLong(commentLong: CommentLong): AlgPart {
    return new CommentLong(commentLong.comment);
  }
}

}

// TODO
// export class TimeStamp extends NonRepeatable implements AlgPart

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

export const SuneSeq: Sequence = new Sequence([
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
