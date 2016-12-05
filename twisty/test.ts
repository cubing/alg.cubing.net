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
  console.log("[Traversal] FURUFCompact = FURURFMoves", !structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFMoves));
  console.log("[Traversal] FURURFMoves = FURURFMoves", structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFMoves));
  console.log("[Traversal] FURURFCompact = FURURFCompact", structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFCompact));
})();

(function TestStructureEqualsChaining() {
  console.log("[Chaining] FURUFCompact = FURURFMoves", !Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFMoves));
  console.log("[Chaining] FURURFMoves = FURURFMoves", Alg.Example.FURURFMoves.structureEquals(Alg.Example.FURURFMoves));
  console.log("[Chaining] FURURFCompact = FURURFCompact", Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFCompact));
  console.log("[Chaining] SuneCommutator != Sune", !Alg.Example.SuneCommutator.structureEquals(Alg.Example.Sune));
})();

(function TestExpand() {
  console.log("[Chaining] Expand FURURFCompact", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.FURURFMoves));
  console.log("[Chaining] Expand Sune", Alg.Example.Sune.expand().structureEquals(Alg.Example.Sune));
  console.log("[Chaining] Expand SuneCommutator", Alg.Example.SuneCommutator.expand().structureEquals(Alg.Example.Sune));
  console.log("[Chaining] Expand FURURFCompact != expand SuneCommutator", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.SuneCommutator.expand()));
})();


(function TestInvert() {
  console.log("[Chaining] Sune double inverted is Sune", Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.Sune));
  console.log("[Chaining] Sune inverse is not Sune", !Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.AntiSune));
  console.log("[Chaining] Sune inverse is AntiSune", Alg.Example.Sune.invert().structureEquals(Alg.Example.AntiSune));
})();
