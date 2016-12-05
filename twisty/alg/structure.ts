"use strict";

namespace Alg {

// TODO: Rename to Part?
export abstract class AlgPart {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.

  clone():           AlgPart { return Alg.Traversal.cloneTraversal.traverse(this);           }
  invert():          AlgPart { return Alg.Traversal.invertTraversal.traverse(this);          }
  expand():          AlgPart { return Alg.Traversal.expandTraversal.traverse(this);          }
  countBlockMoves(): number  { return Alg.Traversal.countBlockMovesTraversal.traverse(this); }
  structureEquals(algPart: AlgPart): boolean {
    return Alg.Traversal.structureEqualsTraversal.traverse(this, algPart);
  }
}

export type Algorithm = AlgPart;

export abstract class Repeatable extends AlgPart {
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

export abstract class NonRepeatable extends AlgPart {
  public readonly abstract type: string
  constructor() {
    super();
  }
}

}
