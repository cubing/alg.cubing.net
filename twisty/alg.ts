"use strict";

// TODO: Support non-SiGN conventions (e.g. clock).
namespace Alg {

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

// TODO: Rename to Part?
export abstract class AlgPart {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.
  abstract repeatable(): boolean

  private cloneTransform: Transformation.Clone = new Transformation.Clone();
  clone(): AlgPart {
    return this.cloneTransform.transform(this);
  }

  private invertTransform: Transformation.Invert = new Transformation.Invert();
  invert(): AlgPart {
    return this.invertTransform.transform(this);
  }

  private expandTransform: Transformation.Expand = new Transformation.Expand();
  expand(): AlgPart {
    return this.expandTransform.transform(this);
  }
}

export type Algorithm = AlgPart;

abstract class Repeatable extends AlgPart {
  public readonly abstract type: string
  // TODO: Make `amount` an optional argument in derived class constructors.
  repeatable(): boolean {
    return true;
  }
  constructor(public amount: number) {
    super();
  }
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

abstract class NonRepeatable extends AlgPart {
  public readonly abstract type: string
  constructor() {
    super();
  }
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

export class Clone extends OfAlgPart {
  public transformSequence(sequence: Sequence): Sequence {
    return new Sequence(sequence.algParts.map(this.transform));
  }
  protected transformGroup(group: Group): AlgPart {
    return new Group(this.transform(group.algPart), group.amount);
  }
  protected transformBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, blockMove.amount);
  }
  protected transformCommutator(commutator: Commutator): AlgPart {
    return new Commutator(this.transform(commutator.A), this.transform(commutator.B), commutator.amount);
  }
  protected transformConjugate(conjugate: Conjugate): AlgPart {
    return new Conjugate(this.transform(conjugate.A), this.transform(conjugate.B), conjugate.amount);
  }
  protected transformPause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected transformNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected transformCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected transformCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Invert extends OfAlgPart {
  public transformSequence(sequence: Sequence): Sequence {
    // TODO: Handle newlines and comments correctly
    return new Sequence(sequence.algParts.reverse().map(this.transform));
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
  protected transformPause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected transformNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected transformCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected transformCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Expand extends OfAlgPart {
  private repeat(algParts: AlgPart[], accordingTo: Repeatable): Sequence {
    var amount = Math.abs(accordingTo.amount);
    var amountDir = (accordingTo.amount > 0) ? 1 : -1; // Mutable

    // TODO: Cleaner inversion
    var directedAlgParts: AlgPart[];
    if (amountDir == -1) {
      // TODO: Avoid casting to sequence.
      directedAlgParts = (<Sequence>(new Sequence(algParts)).invert()).algParts;
    } else {
      directedAlgParts = algParts;
    }

    var repeatedParts: AlgPart[] = [];
    for (var i = 0; i < amount; i++) {
      repeatedParts = repeatedParts.concat(directedAlgParts);
    }

    return new Sequence(repeatedParts);
  }

  public transformSequence(sequence: Sequence): Sequence {
    // TODO: Handle newlines and comments correctly
    return new Sequence(sequence.algParts.map(this.transform));
  }
  protected transformGroup(group: Group): AlgPart {
    // TODO: Pass raw AlgPArts[] to sequence.
    return this.repeat([this.transform(group.algPart)], group);
  }
  protected transformBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  protected transformCommutator(commutator: Commutator): AlgPart {
    var once: AlgPart[] = [];
    once = once.concat(
      commutator.A,
      commutator.B,
      commutator.A.invert(),
      commutator.B.invert()
    );
    return this.repeat(once, commutator);
  }
  protected transformConjugate(conjugate: Conjugate): AlgPart {
    var once: AlgPart[] = [];
    once = once.concat(
      conjugate.A,
      conjugate.B,
      conjugate.A.invert()
    );
    return this.repeat(once, conjugate);
  }
  protected transformPause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected transformNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected transformCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected transformCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

export class CountBlockMoves extends Up<number> {
  public transformSequence(sequence: Sequence): number {
    return 1;
  }
  protected transformGroup(group: Group): number {
    return 1;
  }
  protected transformBlockMove(blockMove: BlockMove): number {
    return 1;
  }
  protected transformCommutator(commutator: Commutator): number {
    return 1;
  }
  protected transformConjugate(conjugate: Conjugate): number {
    return 1;
  }
  protected transformPause(pause: Pause):                      number { return 0; }
  protected transformNewline(newline: Newline):                number { return 0; }
  protected transformCommentShort(commentShort: CommentShort): number { return 0; }
  protected transformCommentLong(commentLong: CommentLong):    number { return 0; }
}

}

// TODO
// export class TimeStamp extends NonRepeatable implements AlgPart

export namespace Example {

export const Sune: Sequence = new Sequence([
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
