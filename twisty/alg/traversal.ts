"use strict";

namespace Alg {
export namespace Traversal {

export abstract class DownUp<DataDown, DataUp> {
  // Immediate subclasses should overwrite this.
  public traverse(segment: Algorithm, dataDown: DataDown): DataUp {
    return this.traverseGeneric(segment, dataDown);
  }

  // A generic version of traverse that should not be overwritten.
  protected traverseGeneric(segment: Algorithm, dataDown: DataDown): DataUp {
    // TODO: Use a direct look up using e.g. hashmap instead of sequential if-else.
    // TODO: Clone arguments by default, for safety.
         if (segment instanceof Sequence)       { return this.traverseSequence(segment, dataDown); }
    else if (segment instanceof Group)          { return this.traverseGroup(segment, dataDown); }
    else if (segment instanceof BlockMove)      { return this.traverseBlockMove(segment, dataDown); }
    else if (segment instanceof Commutator)     { return this.traverseCommutator(segment, dataDown); }
    else if (segment instanceof Conjugate)      { return this.traverseConjugate(segment, dataDown); }
    else if (segment instanceof Pause)          { return this.traversePause(segment, dataDown); }
    else if (segment instanceof NewLine)        { return this.traverseNewLine(segment, dataDown); }
    else if (segment instanceof CommentShort)   { return this.traverseCommentShort(segment, dataDown); }
    else if (segment instanceof CommentLong)    { return this.traverseCommentLong(segment, dataDown); }
    else {
      throw "Unknown type of segment";
    }
  }

  protected abstract traverseSequence(sequence: Sequence, dataDown: DataDown): DataUp;
  protected abstract traverseGroup(group: Group, dataDown: DataDown): DataUp;
  protected abstract traverseBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp;
  protected abstract traverseCommutator(commutator: Commutator, dataDown: DataDown): DataUp;
  protected abstract traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp;
  protected abstract traversePause(pause: Pause, dataDown: DataDown): DataUp;
  protected abstract traverseNewLine(newLine: NewLine, dataDown: DataDown): DataUp;
  protected abstract traverseCommentShort(commentShort: CommentShort, dataDown: DataDown): DataUp;
  protected abstract traverseCommentLong(commentLong: CommentLong, dataDown: DataDown): DataUp;
}

export abstract class Up<DataUp> extends DownUp<undefined, DataUp> {
  public traverse(segment: Algorithm): DataUp {
    return this.traverseGeneric.call(this, segment);
  }

  protected abstract traverseSequence(sequence: Sequence): DataUp;
  protected abstract traverseGroup(group: Group): DataUp;
  protected abstract traverseBlockMove(blockMove: BlockMove): DataUp;
  protected abstract traverseCommutator(commutator: Commutator): DataUp;
  protected abstract traverseConjugate(conjugate: Conjugate): DataUp;
  protected abstract traversePause(pause: Pause): DataUp;
  protected abstract traverseNewLine(newLine: NewLine): DataUp;
  protected abstract traverseCommentShort(commentShort: CommentShort): DataUp;
  protected abstract traverseCommentLong(commentLong: CommentLong): DataUp;
};
export abstract class OfAlgorithm extends Up<Algorithm> {};

export class Clone extends OfAlgorithm {
  public traverseSequence(sequence: Sequence): Sequence {
    return new Sequence(sequence.nestedAlgs.map(a => this.traverse(a)));
  }
  protected traverseGroup(group: Group): Algorithm {
    return new Group(this.traverse(group.nestedAlg), group.amount);
  }
  protected traverseBlockMove(blockMove: BlockMove): Algorithm {
    return new BlockMove(blockMove.base, blockMove.amount);
  }
  protected traverseCommutator(commutator: Commutator): Algorithm {
    return new Commutator(this.traverse(commutator.A), this.traverse(commutator.B), commutator.amount);
  }
  protected traverseConjugate(conjugate: Conjugate): Algorithm {
    return new Conjugate(this.traverse(conjugate.A), this.traverse(conjugate.B), conjugate.amount);
  }
  protected traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  protected traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Invert extends OfAlgorithm {
  public traverseSequence(sequence: Sequence): Sequence {
    // TODO: Handle newLines and comments correctly
    return new Sequence(sequence.nestedAlgs.slice().reverse().map(a => this.traverse(a)));
  }
  protected traverseGroup(group: Group): Algorithm {
    return new Group(this.traverse(group.nestedAlg), group.amount);
  }
  protected traverseBlockMove(blockMove: BlockMove): Algorithm {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  protected traverseCommutator(commutator: Commutator): Algorithm {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }
  protected traverseConjugate(conjugate: Conjugate): Algorithm {
    return new Conjugate(conjugate.A, this.traverse(conjugate.B), conjugate.amount);
  }
  protected traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  protected traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

export class Expand extends OfAlgorithm {
  private flattenSequenceOneLevel(nestedAlgs: Algorithm[]): Algorithm[] {
    var flattened: Algorithm[] = [];
    for (var part of nestedAlgs) {
      if (part instanceof Sequence) {
        flattened = flattened.concat(part.nestedAlgs);
      } else {
        flattened.push(part)
      }
    }
    return flattened;
  }

  private repeat(nestedAlgs: Algorithm[], accordingTo: Repeatable): Sequence {
    var amount = Math.abs(accordingTo.amount);
    var amountDir = (accordingTo.amount > 0) ? 1 : -1; // Mutable

    // TODO: Cleaner inversion
    var directedAlgorithms: Algorithm[];
    if (amountDir == -1) {
      // TODO: Avoid casting to sequence.
      directedAlgorithms = (<Sequence>(new Sequence(nestedAlgs)).invert()).nestedAlgs;
    } else {
      directedAlgorithms = nestedAlgs;
    }

    var repeatedParts: Algorithm[] = [];
    for (var i = 0; i < amount; i++) {
      repeatedParts = repeatedParts.concat(directedAlgorithms);
    }

    return new Sequence(repeatedParts);
  }

  public traverseSequence(sequence: Sequence): Sequence {
    return new Sequence(this.flattenSequenceOneLevel(sequence.nestedAlgs.map(a => this.traverse(a))));
  }
  protected traverseGroup(group: Group): Algorithm {
    // TODO: Pass raw AlgPArts[] to sequence.
    return this.repeat([this.traverse(group.nestedAlg)], group);
  }
  protected traverseBlockMove(blockMove: BlockMove): Algorithm {
    return blockMove.clone();
  }
  protected traverseCommutator(commutator: Commutator): Algorithm {
    var expandedA = this.traverse(commutator.A)
    var expandedB = this.traverse(commutator.B)
    var once: Algorithm[] = [];
    once = once.concat(
      expandedA,
      expandedB,
      expandedA.invert(),
      expandedB.invert()
    );
    return this.repeat(this.flattenSequenceOneLevel(once), commutator);
  }
  protected traverseConjugate(conjugate: Conjugate): Algorithm {
    var expandedA = this.traverse(conjugate.A)
    var expandedB = this.traverse(conjugate.B)
    var once: Algorithm[] = [];
    once = once.concat(
      expandedA,
      expandedB,
      expandedA.invert()
    );
    return this.repeat(this.flattenSequenceOneLevel(once), conjugate);
  }
  protected traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  protected traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

export class CountBlockMoves extends Up<number> {
  public traverseSequence(sequence: Sequence): number {
    var total = 0;
    for (var part of sequence.nestedAlgs) {
      total += this.traverse(part);
    }
    return total;
  }
  protected traverseGroup(group: Group): number {
    return this.traverse(group.nestedAlg);
  }
  protected traverseBlockMove(blockMove: BlockMove): number {
    return 1;
  }
  protected traverseCommutator(commutator: Commutator): number {
    return 2*(this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  protected traverseConjugate(conjugate: Conjugate): number {
    return 2*(this.traverse(conjugate.A)) + this.traverse(conjugate.B);
  }
  protected traversePause(pause: Pause):                      number { return 0; }
  protected traverseNewLine(newLine: NewLine):                number { return 0; }
  protected traverseCommentShort(commentShort: CommentShort): number { return 0; }
  protected traverseCommentLong(commentLong: CommentLong):    number { return 0; }
}

export class StructureEquals extends DownUp<Algorithm, boolean> {
  public traverseSequence(sequence: Sequence, dataDown: Algorithm): boolean {
    if (!(dataDown instanceof Sequence)) {
      return false;
    }
    if (sequence.nestedAlgs.length !== dataDown.nestedAlgs.length) {
      return false;
    }
    for (var i = 0; i < sequence.nestedAlgs.length; i++) {
      if (!this.traverse(sequence.nestedAlgs[i], dataDown.nestedAlgs[i])) {
        return false;
      }
    }
    return true;
  }
  protected traverseGroup(group: Group, dataDown: Algorithm): boolean {
    return (dataDown instanceof Group) && this.traverse(group.nestedAlg, dataDown.nestedAlg);
  }
  protected traverseBlockMove(blockMove: BlockMove, dataDown: Algorithm): boolean {
    // TODO: Handle layers.
    return dataDown instanceof BlockMove &&
           blockMove.base === dataDown.base &&
           blockMove.amount === dataDown.amount;
  }
  protected traverseCommutator(commutator: Commutator, dataDown: Algorithm): boolean {
    return (dataDown instanceof Commutator) &&
           this.traverse(commutator.A, dataDown.A) &&
           this.traverse(commutator.B, dataDown.B);
  }
  protected traverseConjugate(conjugate: Conjugate, dataDown: Algorithm): boolean {
    return (dataDown instanceof Conjugate) &&
           this.traverse(conjugate.A, dataDown.A) &&
           this.traverse(conjugate.B, dataDown.B);
  }
  protected traversePause(pause: Pause, dataDown: Algorithm): boolean {
    return dataDown instanceof Pause;
  }
  protected traverseNewLine(newLine: NewLine, dataDown: Algorithm): boolean {
    return dataDown instanceof NewLine;
  }
  protected traverseCommentShort(commentShort: CommentShort, dataDown: Algorithm): boolean {
    return (dataDown instanceof CommentShort) && (commentShort.comment == dataDown.comment);
  }
  protected traverseCommentLong(commentLong: CommentLong, dataDown: Algorithm): boolean {
    return (dataDown instanceof CommentShort) && (commentLong.comment == dataDown.comment);
  }
}

// TODO: Test that inverses are bijections.
export class CoalesceMoves extends OfAlgorithm {
  private sameBlock(moveA: BlockMove, moveB: BlockMove): boolean {
    // TODO: Handle layers
    return moveA.base === moveB.base;
  }

  private roundCubeMoveAmount(amount: number): number {
    return amount + 4 * Math.round(-Math.abs(amount/4)) * Math.sign(amount);
  }

  public traverseSequence(sequence: Sequence): Sequence {
    var coalesced: Algorithm[] = [];
    for (var part of sequence.nestedAlgs) {
      if (!(part instanceof BlockMove)) {
        coalesced.push(this.traverse(part));
      } else if (coalesced.length > 0) {
        var last = coalesced[coalesced.length-1];
        if (last instanceof BlockMove &&
            this.sameBlock(last, part)) {
          // TODO: This is cube-specific. Perhaps pass the modules as DataDown?
          var amount = this.roundCubeMoveAmount(last.amount + part.amount);
          coalesced.pop();
          if (amount !== 0) {
            // We could modify the last element instead of creating a new one,
            // but this is safe against shifting coding practices.
            // TODO: Figure out if the shoot-in-the-foot risk
            // modification is worth the speed.
            coalesced.push(new BlockMove(part.base, amount));
          }
        } else {
          coalesced.push(part.clone());
        }
      } else {
        coalesced.push(part.clone());
      }
    }
    return new Sequence(coalesced);
  }
  protected traverseGroup(group: Group):                      Algorithm { return group.clone(); }
  protected traverseBlockMove(blockMove: BlockMove):          Algorithm { return blockMove.clone(); }
  protected traverseCommutator(commutator: Commutator):       Algorithm { return commutator.clone(); }
  protected traverseConjugate(conjugate: Conjugate):          Algorithm { return conjugate.clone(); }
  protected traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  protected traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

export class Concat extends DownUp<Algorithm, Sequence> {
  private concatIntoSequence(A: Algorithm[], B: Algorithm): Sequence {
    var nestedAlgs: Algorithm[] = A.slice();
    if (B instanceof Sequence) {
      nestedAlgs = nestedAlgs.concat(B.nestedAlgs)
    } else {
      nestedAlgs.push(B);
    }
    return new Sequence(nestedAlgs)
  }
  protected traverseSequence(     sequence:     Sequence,     dataDown: Algorithm): Sequence {return this.concatIntoSequence(sequence.nestedAlgs, dataDown); }
  protected traverseGroup(        group:        Group,        dataDown: Algorithm): Sequence {return this.concatIntoSequence([group]          , dataDown); }
  protected traverseBlockMove(    blockMove:    BlockMove,    dataDown: Algorithm): Sequence {return this.concatIntoSequence([blockMove]      , dataDown); }
  protected traverseCommutator(   commutator:   Commutator,   dataDown: Algorithm): Sequence {return this.concatIntoSequence([commutator]     , dataDown); }
  protected traverseConjugate(    conjugate:    Conjugate,    dataDown: Algorithm): Sequence {return this.concatIntoSequence([conjugate]      , dataDown); }
  protected traversePause(        pause:        Pause,        dataDown: Algorithm): Sequence {return this.concatIntoSequence([pause]          , dataDown); }
  protected traverseNewLine(      newLine:      NewLine,      dataDown: Algorithm): Sequence {return this.concatIntoSequence([newLine]        , dataDown); }
  protected traverseCommentShort( commentShort: CommentShort, dataDown: Algorithm): Sequence {return this.concatIntoSequence([commentShort]   , dataDown); }
  protected traverseCommentLong(  commentLong:  CommentLong,  dataDown: Algorithm): Sequence {return this.concatIntoSequence([commentLong]    , dataDown); }
}

export namespace Singleton {
  export const clone           = new Clone();
  export const invert          = new Invert();
  export const expand          = new Expand();
  export const countBlockMoves = new CountBlockMoves();
  export const structureEquals = new StructureEquals();
  export const coalesceMoves   = new CoalesceMoves();
  export const concat          = new Concat();
}

}
}