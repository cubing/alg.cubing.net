"use strict";

namespace Alg {
export namespace Example {

export const Sune: Sequence = new Sequence([
  new BlockMove("R",  1),
  new BlockMove("U",  1),
  new BlockMove("R", -1),
  new BlockMove("U",  1),
  new BlockMove("R",  1),
  new BlockMove("U", -2),
  new BlockMove("R", -1)
]);

export const AntiSune: Sequence = new Sequence([
  new BlockMove("R",  1),
  new BlockMove("U",  2),
  new BlockMove("R", -1),
  new BlockMove("U", -1),
  new BlockMove("R",  1),
  new BlockMove("U", -1),
  new BlockMove("R", -1)
]);

export const SuneCommutator: Algorithm = new Commutator(
  new Sequence([
    new BlockMove("R",  1),
    new BlockMove("U",  1),
    new BlockMove("R", -2)
  ]),
  new Sequence([
    new BlockMove("R",  1),
    new BlockMove("U",  1),
    new BlockMove("R", -1)
  ]),
  1
)

export const FURURFCompact: Algorithm = new Conjugate(
  new BlockMove("F",  1),
  new Commutator(
    new BlockMove("U",  1),
    new BlockMove("R",  1),
    1
  ),
  1
);

export const APermCompact: Algorithm = new Conjugate(
  new BlockMove("R", 2),
  new Commutator(
    new BlockMove("F", 2),
    new Sequence([
      new BlockMove("R", -1),
      new BlockMove("B", -1),
      new BlockMove("R", 1),
    ]),
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

export const AllAlgTypes: Algorithm[] = [
  new Sequence([new BlockMove("R", 1), new BlockMove("U", -1)]),
  new Group(new BlockMove("F", 1), 2),
  new BlockMove("R", 2),
  new Commutator(new BlockMove("R", 2), new BlockMove("U", 2), 2),
  new Conjugate(new BlockMove("L", 2), new BlockMove("D", -1), 2),
  new Pause(),
  new NewLine(),
  new CommentShort("short comment"),
  new CommentLong("long comment")
];

}
}
