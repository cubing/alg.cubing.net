"use strict";

namespace Alg {

// TODO: Rename to Part?
export abstract class AlgPart {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.
  abstract repeatable(): boolean

  private cloneTraversal: Traversal.Clone = new Traversal.Clone();
  clone(): AlgPart {
    return this.cloneTraversal.traverse(this);
  }

  private invertTraversal: Traversal.Invert = new Traversal.Invert();
  invert(): AlgPart {
    return this.invertTraversal.traverse(this);
  }

  private expandTraversal: Traversal.Expand = new Traversal.Expand();
  expand(): AlgPart {
    return this.expandTraversal.traverse(this);
  }
}

export type Algorithm = AlgPart;

export abstract class Repeatable extends AlgPart {
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

export abstract class NonRepeatable extends AlgPart {
  public readonly abstract type: string
  constructor() {
    super();
  }
  repeatable(): boolean {
    return false;
  }
}

}
