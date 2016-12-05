"use strict";

namespace Alg {

export abstract class Algorithm {
  public readonly abstract type: string

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
  constructor(public nestedAlgs: Algorithm[]) { super(); }
}

// Group is is like a Sequence, but is enclosed in parentheses when
// written.
export class Group extends Repeatable {
  public type: string = "group";
  constructor(public nestedAlg: Algorithm, amount: number) { super(amount); }
}

export class BlockMove extends Repeatable {
  public type: string = "blockMove";
  // TODO: Typesafe layer types?
  public layer?: number;
  public startLayer?: number;
  public endLayer?: number;
  // TODO: Handle layers in constructor
  constructor(public base: BaseMove, amount: number) { super(amount); }
}

export class Commutator extends Repeatable {
  public type: string = "commutator";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) { super(amount); }
}

export class Conjugate extends Repeatable {
  public type: string = "conjugate";
  constructor(public A: Algorithm, public B: Algorithm, amount: number) { super(amount); }
}

export class Pause extends Algorithm {
  public type: string = "pause";
  constructor() { super(); }
}

export class NewLine extends Algorithm {
  public type: string = "newLine";
  constructor() { super(); }
}

export class CommentShort extends Algorithm {
  public type: string = "commentShort";
  constructor(public comment: string) { super(); }
}

export class CommentLong extends Algorithm {
  public type: string = "commentLong";
  constructor(public comment: string) { super(); }
}

// TODO
// export class TimeStamp extends Algorithm implements Algorithm

export interface AlgorithmJSON {
  type: string;
  nestedAlg?: AlgorithmJSON;
  nestedAlgs?: AlgorithmJSON[];
  base?: string;
  amount?: number;
  A?: AlgorithmJSON;
  B?: AlgorithmJSON;
  comment?: string;
}

// TODO: Implement using Traversal?
export function fromJSON(json: AlgorithmJSON): Algorithm {
  switch (json.type) {
    case "sequence":
      if (!json.nestedAlgs) { throw "Missing nestedAlgs" }
      return new Sequence(json.nestedAlgs.map(j => this.fromJSON(j)));
    case "group":
      if (!json.nestedAlg) { throw "Missing nestedAlg" }
      if (!json.amount) { throw "Missing amount" }
      return new Group(this.fromJSON(json.nestedAlg), json.amount);
    case "blockMove":
      // TODO: Handle layers
      if (!json.base) { throw "Missing base" }
      if (!json.amount) { throw "Missing amount" }
      return new BlockMove(json.base, json.amount);
    case "commutator":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Commutator(this.fromJSON(json.A), this.fromJSON(json.B), json.amount);
    case "conjugate":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Conjugate(this.fromJSON(json.A), this.fromJSON(json.B), json.amount);
    case "pause":
      return new Pause();
    case "newLine":
      return new NewLine();
    case "commentShort":
      if (!json.comment) { throw "Missing comment" }
      return new CommentShort(json.comment);
    case "commentLong":
      if (!json.comment) { throw "Missing comment" }
      return new CommentLong(json.comment);
    default:
      throw "Unknown alg type.";
  }
}

}