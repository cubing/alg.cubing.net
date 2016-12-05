"use strict";

namespace Alg {

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

export class Sequence extends Algorithm {
  public type: string = "sequence";
  constructor(public nestedAlgs: Algorithm[]) {
    super();
  }
}

// Group is is like a Sequence, but is enclosed in parentheses when
// written.
export class Group extends Repeatable {
  public type: string = "group";
  constructor(public nestedAlg: Algorithm, amount: number) {
    super(amount);
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
}

export class Commutator extends Repeatable {
  public type: string = "commutator";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) {
    super(amount);
  }
}

export class Conjugate extends Repeatable {
  public type: string = "conjugate";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) {
    super(amount);
  }
}

export class Pause extends Algorithm {
  public type: string = "pause";
  constructor() {
    super();
  }
}

export class NewLine extends Algorithm {
  public type: string = "newLine";
  constructor() {
    super();
  }
}

export class CommentShort extends Algorithm {
  public type: string = "commentShort";
  constructor(public comment: string) {
    super();
  }
}

export class CommentLong extends Algorithm {
  public type: string = "commentLong";
  constructor(public comment: string) {
    super();
  }
}

// TODO
// export class TimeStamp extends Algorithm implements Algorithm

}