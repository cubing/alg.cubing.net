"use strict";

namespace Twisty {

class Cursor {
  private cursor: Timeline.Duration;
  constructor(private alg: Alg.Algorithm) {
    this.cursor = 0;
  }
}

namespace Cursor {

abstract class Position<AlgType extends Alg.Algorithm> {
  Alg: AlgType;
  Direction: Timeline.Direction;
  TimeToSubAlg: Timeline.Duration;
  SubAlg: Alg.Algorithm | null;
}

class SequencePosition extends Position<Alg.Sequence> {
  constructor() { super(); }
}

class GroupPosition extends Position<Alg.Group> {
  constructor() { super(); }
}

class BlockMovePosition extends Position<Alg.BlockMove> {
  constructor() { super(); }
}

class CommutatorPosition extends Position<Alg.Commutator> {
  constructor() { super(); }
}

class ConjugatePosition extends Position<Alg.Conjugate> {
  constructor() { super(); }
}

class PausePosition extends Position<Alg.Pause> {
  constructor() { super(); }
}

class NewLinePosition extends Position<Alg.NewLine> {
  constructor() { super(); }
}

class CommentShortPosition extends Position<Alg.CommentShort> {
  constructor() { super(); }
}

class CommentLongPosition extends Position<Alg.CommentLong> {
  constructor() { super(); }
}


}

}