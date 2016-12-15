"use strict";

namespace Alg {

export abstract class Algorithm {
  public readonly abstract type: string
  abstract dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp;

  // TODO: Figure out if we can statically enforce that all Algorithm subclasses
  // are frozen after initial construction.
  protected freeze() {
    Object.freeze(this);
  }

  clone():           Algorithm { return Alg.Traversal.Singleton.clone.traverse(this);           }
  invert():          Algorithm { return Alg.Traversal.Singleton.invert.traverse(this);          }
  expand():          Algorithm { return Alg.Traversal.Singleton.expand.traverse(this);          }
  countBlockMoves(): number    { return Alg.Traversal.Singleton.countBlockMoves.traverse(this); }
  coalesceMoves():   Algorithm { return Alg.Traversal.Singleton.coalesceMoves.traverse(this);   }
  toString():        string    { return Alg.Traversal.Singleton.toString.traverse(this);        }

  structureEquals(nestedAlg: Algorithm): boolean {
    return Alg.Traversal.Singleton.structureEquals.traverse(this, nestedAlg);
  }
  concat(nestedAlg: Algorithm): Sequence {
    return Alg.Traversal.Singleton.concat.traverse(this, nestedAlg);
  }
}

export abstract class Repeatable extends Algorithm {
  // TODO: Make `amount` an optional argument in derived class constructors.
  constructor(public amount: number) {
    super();
  }
}

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

export class Sequence extends Algorithm {
  public type: string = "sequence";
  constructor(public nestedAlgs: Algorithm[]) {
    super();
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseSequence(this, dataDown);
  }
}

// Group is is like a Sequence, but is enclosed in parentheses when
// written.
export class Group extends Repeatable {
  public type: string = "group";
  constructor(public nestedAlg: Algorithm, amount: number) {
    super(amount);
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseGroup(this, dataDown);
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
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseBlockMove(this, dataDown);
  }
}

export class Commutator extends Repeatable {
  public type: string = "commutator";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) {
    super(amount);
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseCommutator(this, dataDown);
  }
}

export class Conjugate extends Repeatable {
  public type: string = "conjugate";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) {
    super(amount);
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseConjugate(this, dataDown);
  }
}

export class Pause extends Algorithm {
  public type: string = "pause";
  constructor() {
    super();
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traversePause(this, dataDown);
  }
}

export class NewLine extends Algorithm {
  public type: string = "newLine";
  constructor() {
    super();
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseNewLine(this, dataDown);
  }
}

export class CommentShort extends Algorithm {
  public type: string = "commentShort";
  constructor(public comment: string) {
    super();
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseCommentShort(this, dataDown);
  }
}

export class CommentLong extends Algorithm {
  public type: string = "commentLong";
  constructor(public comment: string) {
    super();
    this.freeze();
  }
  dispatch<DataDown, DataUp>(t: Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
    return t.traverseCommentLong(this, dataDown);
  }
}

// TODO
// export class TimeStamp extends Algorithm implements Algorithm

}
