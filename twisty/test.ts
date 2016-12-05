"use strict";

// Hacky, yet effective.
function test(name: string, condition: boolean) {
  var li = document.createElement("li");
  if (condition) {
    console.log("\u2705 " + name);
    li.textContent = "\u2705 " + name;
  } else {
    console.error("\u274C " + name);
    li.textContent = "\u274C " + name;
  }
  document.write(new XMLSerializer().serializeToString(li));
}

(function TestToString() {
  var alg = Alg.Example.Sune;
  test("Sune moves", alg.toString() === "R U R' U R U2' R'");
  test("String() vs. toString()", String(alg) === alg.toString());
})();

(function TestSimpleBreakPoints() {
  var b1 = new Twisty.TimeLine.SimpleBreakPoints([30, 400, 1500, 2000]);
  test("First breakpoint", b1.firstBreakPoint() === 30);
  test("Last breakpoint", b1.lastBreakPoint() === 2000);
  test("Forwards from beginning", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 30) === 400);
  test("Forwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 400) === 1500);
  test("Forwards between breakpoints", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 600) === 1500);
  test("Backwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 400) === 30);
  test("Backwards from just before end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 1999) === 1500);
  test("Backwards frmo end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 2000) === 1500);
})();

(function TestCountBlockMoves() {
  var t = new Alg.Traversal.CountBlockMoves();
  test("Sune has 7 moves", t.traverse(Alg.Example.Sune) === 7);
  test("FURUrF compact has 7 moves", t.traverse(Alg.Example.FURURFCompact) === 6);
})();

(function TestStructureEqualsTraversal() {
  var structureEquals = new Alg.Traversal.StructureEquals();
  test("[Traversal] FURUFCompact !== FURURFMoves", !structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFMoves));
  test("[Traversal] FURURFMoves !== FURUFCompact", !structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFCompact));
  test("[Traversal] FURURFMoves == FURURFMoves", structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFMoves));
  test("[Traversal] FURURFCompact == FURURFCompact", structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFCompact));
})();

(function TestStructureEquals() {
  test("FURUFCompact == FURURFMoves", !Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFMoves));
  test("FURURFMoves == FURURFMoves", Alg.Example.FURURFMoves.structureEquals(Alg.Example.FURURFMoves));
  test("FURURFCompact == FURURFCompact", Alg.Example.FURURFCompact.structureEquals(Alg.Example.FURURFCompact));
  test("SuneCommutator != Sune", !Alg.Example.SuneCommutator.structureEquals(Alg.Example.Sune));
})();

(function TestExpand() {
  test("Expand FURURFCompact", Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.FURURFMoves));
  test("Expand Sune (fixed point)", Alg.Example.Sune.expand().structureEquals(Alg.Example.Sune));
  test("Expand SuneCommutator", !Alg.Example.SuneCommutator.expand().structureEquals(Alg.Example.Sune));
  test("Expand FURURFCompact != expand SuneCommutator", !Alg.Example.FURURFCompact.expand().structureEquals(Alg.Example.SuneCommutator.expand()));
})();

(function TestInvert() {
  test("Sune double inverted is Sune", Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.Sune));
  test("Sune inverse is not Sune", !Alg.Example.Sune.invert().invert().structureEquals(Alg.Example.AntiSune));
  test("Sune inverse is AntiSune", Alg.Example.Sune.invert().structureEquals(Alg.Example.AntiSune));
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
  test("Coalesce U U", UU_raw.coalesceMoves().structureEquals(U2));
  test("Coalesce U U string value", UU_raw.coalesceMoves().toString() === "U2");
  test("Expanded SuneCommutator coalesces into Sune", Alg.Example.SuneCommutator.expand().coalesceMoves().structureEquals(Alg.Example.Sune));
})();

(function TestConcat() {
  test("Concat U U", U.concat(U).structureEquals(UU_raw));
  test("Concat U U string value", U.concat(U).toString() === "U U");
  test("Concatenation associativity", U.concat(R.concat(U)).structureEquals(U.concat(R).concat(U)));
  test("Build Sune", R.concat(U).concat(R.invert()).concat(U).concat(R).concat(U2.invert()).concat(R.invert()).structureEquals(Alg.Example.Sune));
})();

(function TestJSON() {
  test("FURURFCompact JSON string roundtrip", Alg.fromJSON(JSON.parse(JSON.stringify(Alg.Example.FURURFCompact))).structureEquals(Alg.Example.FURURFCompact));
})();
