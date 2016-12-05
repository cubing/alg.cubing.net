"use strict";

(function TestToString() {
  var alg = Alg.Example.Sune;
  console.log("Sune moves", alg.toString() === "R U R' U R U2' R'");
  console.log("String() vs. toString()", String(alg) === alg.toString());
})();

(function TestSimpleBreakPoints() {
  var b1 = new Twisty.TimeLine.SimpleBreakPoints([30, 400, 1500, 2000]);
  console.log("First breakpoint", b1.firstBreakPoint() === 30);
  console.log("Last breakpoint", b1.lastBreakPoint() === 2000);
  console.log("Forwards from beginning", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 30) === 400);
  console.log("Forwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 400) === 1500);
  console.log("Forwards between breakpoints", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 600) === 1500);
  console.log("Backwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 400) === 30);
  console.log("Backwards from just before end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 1999) === 1500);
  console.log("Backwards frmo end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 2000) === 1500);
})();

(function TestCountBlockMoves() {
  var t = new Alg.Traversal.CountBlockMoves();
  console.log("Sune has 7 moves", t.traverse(Alg.Example.Sune) === 7);
  console.log("FURUrF compact has 7 moves", t.traverse(Alg.Example.FURURFCompact) === 6);
})();

(function TestStructureEqualsTraversal() {
  var structureEquals = new Alg.Traversal.StructureEquals();
  console.log("[Traversal] FURUFCompact !== FURURFMoves", !structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFMoves));
  console.log("[Traversal] FURUFCompact !== FURURFMoves", !structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFCompact));
  console.log("[Traversal] FURURFMoves == FURURFMoves", structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFMoves));
  console.log("[Traversal] FURURFCompact == FURURFCompact", structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFCompact));
})();

(function TestStructureEquals() {
  console.log("FURUFCompact == FURURFMoves", !Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFMoves));
  console.log("FURURFMoves == FURURFMoves", Alg.Example.FURURFMoves.structureEquals(Alg.Example.FURURFMoves));
  console.log("FURURFCompact == FURURFCompact", Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFCompact));
  console.log("SuneCommutator != Sune", !Alg.Example.SuneCommutator.structureEquals(Alg.Example.Sune));
})();

(function TestExpand() {
  console.log("Expand FURURFCompact", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.FURURFMoves));
  console.log("Expand Sune", Alg.Example.Sune.expand().structureEquals(Alg.Example.Sune));
  console.log("Expand SuneCommutator", Alg.Example.SuneCommutator.expand().structureEquals(Alg.Example.Sune));
  console.log("Expand FURURFCompact != expand SuneCommutator", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.SuneCommutator.expand()));
})();

(function TestInvert() {
  console.log("Sune double inverted is Sune", Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.Sune));
  console.log("Sune inverse is not Sune", !Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.AntiSune));
  console.log("Sune inverse is AntiSune", Alg.Example.Sune.invert().structureEquals(Alg.Example.AntiSune));
})();

(function TestCoalesceMoves() {
  console.log("Sune double inverted is Sune", Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.Sune));
  console.log("Sune inverse is not Sune", !Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.AntiSune));
  console.log("Sune inverse is AntiSune", Alg.Example.Sune.invert().structureEquals(Alg.Example.AntiSune));
})();

(function TestCoalesceMoves() {
  var UU = new Alg.Sequence([
    new Alg.BlockMove("U", 1),
    new Alg.BlockMove("U", 1)
  ]);
  var U2 = new Alg.Sequence([
    new Alg.BlockMove("U", 2)
  ]);
  console.log("Coalesce U U", UU.coalesceMoves().structureEquals(U2));
  console.log("Expanded SuneCommutator coalesces into Sune", Alg.Example.SuneCommutator.expand().coalesceMoves().structureEquals(Alg.Example.Sune));
})();
