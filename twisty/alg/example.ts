"use strict";

namespace Alg {
export namespace Example {

export const Sune: Sequence = new Sequence([
      new BlockMove("R",  1),
      new BlockMove("U",  1),
      new BlockMove("R", -1),
      new BlockMove("U",  1),
      new BlockMove("R",  1),
      new BlockMove("U",  2),
      new BlockMove("R", -1)
    ]);

export const FURURFCompact: Algorithm = new Conjugate(
  new BlockMove("F",  1),
  new Commutator(
    new BlockMove("U",  1),
    new BlockMove("R",  1),
    1
  ),
  1
);
export const FURURFMoves: Algorithm = new Sequence([
  new BlockMove("F",  1),
  new BlockMove("U",  1),
  new BlockMove("R",  1),
  new BlockMove("U", -1),
  new BlockMove("R", -1),
  new BlockMove("F", -1)
]);

}
}
