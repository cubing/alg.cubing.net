"use strict";

// Hacky, yet effective.
function algTest(description: string, condition: boolean) {
  var li = document.createElement("li");
  if (condition) {
    console.log("\u2705 " + description);
    li.textContent = "\u2705 " + description;
  } else {
    console.error("\u274C " + description);
    li.textContent = "\u274C " + description;
  }
  document.write(new XMLSerializer().serializeToString(li));
}

(function TestToString() {
  var alg = Alg.Example.Sune;
  algTest("Sune moves", alg.toString() === "R U R' U R U2' R'");
  algTest("String() vs. toString()", String(alg) === alg.toString());
})();

(function TestCountBlockMoves() {
  var t = new Alg.Traversal.CountBlockMoves();
  algTest("Sune has 7 moves", t.traverse(Alg.Example.Sune) === 7);
  algTest("FURURFCompact has 7 moves", t.traverse(Alg.Example.FURURFCompact) === 6);
})();

(function TestStructureEqualsTraversal() {
  var structureEquals = new Alg.Traversal.StructureEquals();
  algTest("[Traversal] FURUFCompact !== FURURFMoves", !structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFMoves));
  algTest("[Traversal] FURURFMoves !== FURUFCompact", !structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFCompact));
  algTest("[Traversal] FURURFMoves == FURURFMoves", structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFMoves));
  algTest("[Traversal] FURURFCompact == FURURFCompact", structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFCompact));
})();

(function TestStructureEquals() {
  algTest("FURUFCompact == FURURFMoves", !Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFMoves));
  algTest("FURURFMoves == FURURFMoves", Alg.Example.FURURFMoves.structureEquals(Alg.Example.FURURFMoves));
  algTest("FURURFCompact == FURURFCompact", Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFCompact));
  algTest("SuneCommutator != Sune", !Alg.Example.SuneCommutator.structureEquals(Alg.Example.Sune));
})();

(function TestExpand() {
  algTest("Expand FURURFCompact", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.FURURFMoves));
  algTest("Expand Sune (fixed point)", Alg.Example.Sune.expand().structureEquals(Alg.Example.Sune));
  algTest("Expand SuneCommutator", !Alg.Example.SuneCommutator.expand().structureEquals(Alg.Example.Sune));
  algTest("Expand FURURFCompact != expand SuneCommutator", !Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.SuneCommutator.expand()));
})();

(function TestInvert() {
  algTest("Sune double inverted is Sune", Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.Sune));
  algTest("Sune inverse is not Sune", !Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.AntiSune));
  algTest("Sune inverse is AntiSune", Alg.Example.Sune.invert().structureEquals(Alg.Example.AntiSune));
})();

var U = new Alg.BlockMove("U", 1);
var UU_raw = new Alg.Sequence([
  new Alg.BlockMove("U", 1),
  new Alg.BlockMove("U", 1)
]);
var U2 = new Alg.Sequence([
  new Alg.BlockMove("U", 2)
]);
var R = new Alg.Sequence([
  new Alg.BlockMove("R", 1)
]);

(function TestCoalesceMoves() {
  algTest("Coalesce U U", UU_raw.coalesceMoves().structureEquals(U2));
  algTest("Coalesce U U string value", UU_raw.coalesceMoves().toString() === "U2");
  algTest("Expanded SuneCommutator coalesces into Sune", Alg.Example.SuneCommutator.expand().coalesceMoves().structureEquals(Alg.Example.Sune));
})();

(function TestConcat() {
  algTest("Concat U U", U.concat(U).structureEquals(UU_raw));
  algTest("Concat U U string value", U.concat(U).toString() === "U U");
  algTest("Concatenation associativity", U.concat(R.concat(U)).structureEquals(U.concat(R).concat(U)));
  algTest("Build Sune", R.concat(U).concat(R.invert()).concat(U).concat(R).concat(U2.invert()).concat(R.invert()).structureEquals(Alg.Example.Sune));
})();

(function TestJSON() {
  algTest("FURURFCompact JSON string roundtrip", Alg.fromJSON(JSON.parse(JSON.stringify(Alg.Example.FURURFCompact))).structureEquals(Alg.Example.FURURFCompact));
})();


// TODO: Test that inverses are bijections.
class Depth extends Alg.Traversal.Up<number> {
  public traverseSequence(sequence: Alg.Sequence): number {
    var max = 0;
    for (var part of sequence.nestedAlgs) {
      max = Math.max(max, this.traverse(part));
    }
    return max;
  }
  public traverseGroup(group: Alg.Group): number {
    return 1 + this.traverse(group.nestedAlg);
  }
  public traverseBlockMove(blockMove: Alg.BlockMove): number {
    return 0;
  }
  public traverseCommutator(commutator: Alg.Commutator): number {
    return 1 + Math.max(this.traverse(commutator.A), this.traverse(commutator.B));
  }
  public traverseConjugate(conjugate: Alg.Conjugate): number {
    return 1 + Math.max(this.traverse(conjugate.A), this.traverse(conjugate.B));
  }
  public traversePause(pause: Alg.Pause):                      number { return 0; }
  public traverseNewLine(newLine: Alg.NewLine):                number { return 0; }
  public traverseCommentShort(commentShort: Alg.CommentShort): number { return 0; }
  public traverseCommentLong(commentLong: Alg.CommentLong):    number { return 0; }
}

(function TestTraversal() {
  var depth = new Depth();
  algTest("Regular Sune depth", depth.traverse(Alg.Example.Sune) === 0);
  algTest("SuneCommutator depth", depth.traverse(Alg.Example.SuneCommutator) === 1);
  algTest("FRURFCompact depth", depth.traverse(Alg.Example.FURURFCompact) === 2);
})();

(function TestNewAlgTypeNewTraversal() {

  class ConfabAwareClone extends Alg.Traversal.Clone  {
    public traverseConfabulator(confabulator: Confabulator): Alg.Algorithm {
      return new Alg.Commutator(confabulator.A.clone(), confabulator.A.clone(), 3);

    }
  }

  class Confabulator extends Alg.Algorithm {
    public type: string = "confabulator";
    constructor(public A: Alg.Algorithm) {
      super();
      this.freeze();
    }
    dispatch<DataDown, DataUp>(t: Alg.Traversal.DownUp<DataDown, DataUp>, dataDown: DataDown): DataUp {
      // TODO: can we do this without breaking the type system?
      return (t as any).traverseConfabulator(this, dataDown);
    }
  }

  // TODO: Figure out how to add definitions to existing traversals like ToString.

  var h = new ConfabAwareClone();
  var t = h.traverse(new Alg.Group(new Confabulator(new Alg.BlockMove("R", 1)), 2));
  // console.log();
  algTest("Check that you can create a new traversal for a new algorithm type.", t.structureEquals(new Alg.Group(new Alg.Commutator(new Alg.BlockMove("R", 1), new Alg.BlockMove("R", 1), 3), 2)));
  algTest("Check traversed confabulator.", t.toString() === "([R, R]3)2");
})();


// TODO: Cover all alg types
(function TestThatAlgorithmsAreFrozen() {
  for (var a of Alg.Example.AllAlgTypes) {
    algTest(`Alg of type ${a.type} is frozen`, Object.isFrozen(a));
  }
})();

(function TestBlockMoveFrozen() {
  var b = new Alg.BlockMove("R", 4);
  var e: any;
  try {
    b.amount = 2;
  } catch (err) {
    e = err;
  }
   algTest("Modifying BlockMove should not succeed.", e instanceof TypeError);
})();
