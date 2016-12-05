"use strict";

(function TestAlg() {
  var alg = Alg.Example.Sune;
  console.log(alg.toString() === "R U R' U R U2 R'");
  console.log(String(alg) === alg.toString());
})();


(function TestSimpleBreakPoints() {
  var b1 = new Twisty.TimeLine.SimpleBreakPoints([30, 400, 1500, 2000]);
  console.log(b1.firstBreakPoint() === 30);
  console.log(b1.lastBreakPoint() === 2000);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 30) === 400);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 400) === 1500);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 600) === 1500);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 400) === 30);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 1999) === 1500);
  console.log(b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 2000) === 1500);
})();

(function TestCountBlockMoves() {
  var t = new Alg.Traversal.CountBlockMoves();
  console.log(t.traverse(Alg.Example.Sune) === 7);
  console.log(t.traverse(Alg.Example.FURURFCompact) === 6);
})();

(function TestStructureEquals() {
  var structureEquals = new Alg.Traversal.StructureEquals();
  var expand = new Alg.Traversal.Expand();
  console.log(!structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFMoves));
  console.log(structureEquals.traverse(Alg.Example.FURURFMoves, Alg.Example.FURURFMoves));
  console.log(structureEquals.traverse(Alg.Example.FURURFCompact, Alg.Example.FURURFCompact));
  console.log(structureEquals.traverse(expand.traverse(Alg.Example.FURURFCompact), Alg.Example.FURURFMoves));
})();
