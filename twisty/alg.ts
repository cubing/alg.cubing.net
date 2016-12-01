"use strict";

class Alg {
  // TODO: Make `moves` private and create a public interface.
  constructor(public moves: Alg.Move[]) {}
  toString(): string {
    return this.moves.join(" ");
  }
}

// TODO: Support non-SiGN conventions (e.g. clock).
namespace Alg {

export type BaseMove = string; // TODO: Convert to an enum with string mappings.

export class Block {
  constructor(public base: BaseMove, public amount: number) {
  }
  toString(): String {
    var absAmount = Math.abs(this.amount);
    var s = this.base;
    if (absAmount !== 1) {
      s += String(absAmount)
    }
    if (absAmount !== this.amount) {
      s += "'"
    }
    return s;
  }
// move.amount
// move.base
// move.endLayer
// move.layer
// move.startLayer
// move.type
}

export type Move = Block; // TODO: Generalize.

class TestAlg {
  constructor() {
    var alg = new Alg([
      new Block("R",  1),
      new Block("U",  1),
      new Block("R", -1),
      new Block("U",  1),
      new Block("R",  1),
      new Block("U",  2),
      new Block("R", -1)
    ]);
    console.log(alg.toString() === "R U R' U R U2 R'");
    console.log(String(alg) === alg.toString());
  }
}

new TestAlg();

}
