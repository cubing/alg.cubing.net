"use strict";


namespace Twisty {

// Scaffolding to experiment with implementation.
// All code in `Temp` should be gone by 2.0
namespace Temp {
  export class BasicAlg {
    private breakpoints: number[];
    constructor(private moves: string[]) {
      this.breakpoints = [];
      for (var i = 0; i <= moves.length; i++) {
        this.breakpoints.push(i * 1000);
      }
    }

    breakPointModel(): TimeLine.BreakPointModel {
      return new TimeLine.SimpleBreakPoints(this.breakpoints);
    }
  }
}

export class TimeLine {
  public alg: Temp.BasicAlg;
  public breakPointModel: TimeLine.BreakPointModel;
  constructor() {
    this.alg = new Temp.BasicAlg(["R", "U", "R'", "D"]);
    this.breakPointModel = this.alg.breakPointModel();
  }
}

export namespace TimeLine {

// The values are animation scaling factors.
// TODO: "Paused" is more of an Anim concept. Can we get it out of the TimeLine
// namespace in a natural way?
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1
}

export enum BreakPointType {
  Move,
  EntireMoveSequence
}

// TODO: Extend `number`, introduce MoveSequenceTimeStamp vs. EpochTimeStamp,
// force Duration to be a difference.
export type Duration = number; // Duration in milliseconds
export type TimeStamp = Duration; // Duration since a particular epoch.

// TODO: Handle different types of breakpoints:
// - Move
// - Line
// - Start/end of move sequence.
// - "section" (e.g. scramble section, solve section)
export interface BreakPointModel {
  firstBreakPoint(): Duration;
  lastBreakPoint(): Duration;
  // TODO: Define semantics if `duration` is past the end.
  breakPoint(direction: Direction, breakPointType: BreakPointType, duration: Duration): Duration;
}

export class SimpleBreakPoints implements BreakPointModel {
    // Assumes breakPointList is sorted.
    constructor(private breakPointList: Duration[]) {}

    firstBreakPoint() {
      return this.breakPointList[0];
    }
    lastBreakPoint() {
      return this.breakPointList[this.breakPointList.length - 1];
    }

    breakPoint(direction: Direction, breakPointType: BreakPointType, duration: Duration) {
      if (direction === Direction.Backwards) {
        var l = this.breakPointList.filter(d2 => d2 < duration);
        if (l.length === 0 || breakPointType === BreakPointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakPointType == EntireMoveSequence
          return this.firstBreakPoint();
        }
        return l[l.length - 1];
      } else {
        var l = this.breakPointList.filter(d2 => d2 > duration);
        if (l.length === 0 || breakPointType === BreakPointType.EntireMoveSequence) {
          // TODO: Avoid list filtering above if breakPointType == EntireMoveSequence
          return this.lastBreakPoint();
        }
        return l[0];
      }
    }
}

class TestSimpleBreakPoints {
  constructor() {
    var b1 = new SimpleBreakPoints([30, 400, 1500, 2000]);
    console.log(b1.firstBreakPoint() === 30);
    console.log(b1.lastBreakPoint() === 2000);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 30) === 400);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 400) === 1500);
    console.log(b1.breakPoint(Direction.Forwards, BreakPointType.Move, 600) === 1500);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 400) === 30);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 1999) === 1500);
    console.log(b1.breakPoint(Direction.Backwards, BreakPointType.Move, 2000) === 1500);
  }
}

// new TestSimpleBreakPoints();

}
}