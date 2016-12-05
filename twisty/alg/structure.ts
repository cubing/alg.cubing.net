"use strict";

namespace Alg {

// TODO: Rename to Part?
export abstract class Algorithm {
  public readonly abstract type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.

  clone():           Algorithm { return Alg.Traversal.Singleton.clone.traverse(this);           }
  invert():          Algorithm { return Alg.Traversal.Singleton.invert.traverse(this);          }
  expand():          Algorithm { return Alg.Traversal.Singleton.expand.traverse(this);          }
  countBlockMoves(): number  { return Alg.Traversal.Singleton.countBlockMoves.traverse(this); }
  coalesceMoves():   Algorithm { return Alg.Traversal.Singleton.coalesceMoves.traverse(this); }
  toString():        string    { return Alg.Traversal.Singleton.toString.traverse(this); }

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

}
