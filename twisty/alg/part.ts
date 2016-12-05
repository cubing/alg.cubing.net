"use strict";

namespace Alg {

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

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
export class Group extends Repeatable {
  public type: string = "group";
  constructor(public algPart: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "(" + this.algPart + ")" + this.repetitionSuffix();
  }
}

export class BlockMove extends Repeatable {
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

export class Commutator extends Repeatable {
  public type: string = "commutator";
  constructor(public A: AlgPart, public B: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ", " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Conjugate extends Repeatable {
  public type: string = "conjugate";
  constructor(public A: AlgPart, public B: AlgPart, amount: number) {
    super(amount);
  }
  toString(): string {
    return "[" + this.A + ": " + this.B + "]" + this.repetitionSuffix();
  }
}

export class Pause extends NonRepeatable {
  public type: string = "pause";
  constructor() {
    super();
  }
  toString(): string {
    // TODO: Coalesce repeated pauses.
    return ".";
  }
}

export class Newline extends NonRepeatable {
  public type: string = "newline";
  constructor() {
    super();
  }
  toString(): string {
    return "\n";
  }
}

export class CommentShort extends NonRepeatable {
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

export class CommentLong extends NonRepeatable {
  public type: string = "commentLong";
  constructor(public comment: string) {
    super();
  }
  toString(): string {
    // TODO: Sanitize `*/`
    return "/*" + this.comment + "*/";
  }
}

// TODO
// export class TimeStamp extends NonRepeatable implements AlgPart

}