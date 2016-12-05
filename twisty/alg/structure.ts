"use strict";

namespace Alg {

// TODO: Rename to Part?
export abstract class Algorithm {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.

  clone():           Algorithm { return Alg.Traversal.Singleton.clone.traverse(this);           }
  invert():          Algorithm { return Alg.Traversal.Singleton.invert.traverse(this);          }
  expand():          Algorithm { return Alg.Traversal.Singleton.expand.traverse(this);          }
  countBlockMoves(): number  { return Alg.Traversal.Singleton.countBlockMoves.traverse(this); }
  coalesceMoves():   Algorithm { return Alg.Traversal.Singleton.coalesceMoves.traverse(this); }

  structureEquals(nestedAlg: Algorithm): boolean {
    return Alg.Traversal.Singleton.structureEquals.traverse(this, nestedAlg);
  }
  concat(nestedAlg: Algorithm): Sequence {
    return Alg.Traversal.Singleton.concat.traverse(this, nestedAlg);
  }
}

export abstract class Repeatable extends Algorithm {
  public readonly abstract type: string
  // TODO: Make `amount` an optional argument in derived class constructors.
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

export abstract class NonRepeatable extends Algorithm {
  public readonly abstract type: string
  constructor() {
    super();
  }
}

}
