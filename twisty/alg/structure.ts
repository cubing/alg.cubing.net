"use strict";

namespace Alg {

// TODO: Rename to Part?
export abstract class AlgPart {
  readonly type: string
  // TODO: Try to enforce an explicit toString implementation without adding
  // indirection.
  abstract repeatable(): boolean

  private cloneTransform: Transform.Clone = new Transform.Clone();
  clone(): AlgPart {
    return this.cloneTransform.transform(this);
  }

  private invertTransform: Transform.Invert = new Transform.Invert();
  invert(): AlgPart {
    return this.invertTransform.transform(this);
  }

  private expandTransform: Transform.Expand = new Transform.Expand();
  expand(): AlgPart {
    return this.expandTransform.transform(this);
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
