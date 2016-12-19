"use strict";

// Hacky, yet effective.
function twistyTest(description: string, condition: boolean) {
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

(function TestSimpleBreakPoints() {
  var b1 = new Twisty.TimeLine.SimpleBreakPoints([30, 400, 1500, 2000]);
  twistyTest("First breakpoint", b1.firstBreakPoint() === 30);
  twistyTest("Last breakpoint", b1.lastBreakPoint() === 2000);
  twistyTest("Forwards from beginning", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 30) === 400);
  twistyTest("Forwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 400) === 1500);
  twistyTest("Forwards between breakpoints", b1.breakPoint(Twisty.TimeLine.Direction.Forwards, Twisty.TimeLine.BreakPointType.Move, 600) === 1500);
  twistyTest("Backwards from first breakpoint", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 400) === 30);
  twistyTest("Backwards from just before end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 1999) === 1500);
  twistyTest("Backwards from end", b1.breakPoint(Twisty.TimeLine.Direction.Backwards, Twisty.TimeLine.BreakPointType.Move, 2000) === 1500);
})();


(function TestDurations() {
  console.log(new Twisty.TimeLine.AlgDuration(Twisty.TimeLine.DefaultDurationForAmount).traverse(Alg.Example.Sune));
  // twistyTest("First breakpoint", new AlgDuration(DefaultDurationForAmount).traverse(Alg.Example.Sune));
})();

(function TestAlgCursor() {
  // TODO: Test Defaults
  var positionFn = new Twisty.TimeLine.AlgPosition();
  var dirCursor = new Twisty.TimeLine.DirectionWithCursor(Twisty.TimeLine.Direction.Forwards, 4300);
  console.log(positionFn.traverse(Alg.Example.FURURFCompact, dirCursor));

  var alg2= new Alg.Conjugate(
  new Alg.BlockMove("F",  1),
  new Alg.Commutator(
    new Alg.BlockMove("U",  2),
    new Alg.BlockMove("R",  1),
    1
  ),
  1);

  dirCursor = new Twisty.TimeLine.DirectionWithCursor(Twisty.TimeLine.Direction.Forwards, 4300);
  console.log(positionFn.traverse(alg2, dirCursor));

  // twistyTest("First breakpoint", new AlgDuration(DefaultDurationForAmount).traverse(Alg.Example.Sune));
})();
// console.log(
//   ,
//   new AlgDuration(ConstantDurationForAmount).traverse(Alg.Example.Sune)
// );
