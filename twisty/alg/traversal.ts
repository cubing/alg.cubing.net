"use strict";

namespace Alg {
export namespace Traversal {

export abstract class DownUp<DataDown, DataUp> {
  // Immediate subclasses should overwrite this.
  public traverse(algorithm: Algorithm, dataDown: DataDown): DataUp {
    return algorithm.dispatch(this, dataDown);
  }

  public abstract traverseSequence(sequence: Sequence, dataDown: DataDown): DataUp;
  public abstract traverseGroup(group: Group, dataDown: DataDown): DataUp;
  public abstract traverseBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp;
  public abstract traverseCommutator(commutator: Commutator, dataDown: DataDown): DataUp;
  public abstract traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp;
  public abstract traversePause(pause: Pause, dataDown: DataDown): DataUp;
  public abstract traverseNewLine(newLine: NewLine, dataDown: DataDown): DataUp;
  public abstract traverseCommentShort(commentShort: CommentShort, dataDown: DataDown): DataUp;
  public abstract traverseCommentLong(commentLong: CommentLong, dataDown: DataDown): DataUp;
}

export abstract class Up<DataUp> extends DownUp<undefined, DataUp> {
  public traverse(algorithm: Algorithm): DataUp {
    return algorithm.dispatch(this, undefined);
  }

  public abstract traverseSequence(sequence: Sequence): DataUp;
  public abstract traverseGroup(group: Group): DataUp;
  public abstract traverseBlockMove(blockMove: BlockMove): DataUp;
  public abstract traverseCommutator(commutator: Commutator): DataUp;
  public abstract traverseConjugate(conjugate: Conjugate): DataUp;
  public abstract traversePause(pause: Pause): DataUp;
  public abstract traverseNewLine(newLine: NewLine): DataUp;
  public abstract traverseCommentShort(commentShort: CommentShort): DataUp;
  public abstract traverseCommentLong(commentLong: CommentLong): DataUp;
};

export class Clone extends Up<Algorithm> {
  public traverseSequence(sequence: Sequence): Sequence {
    return new Sequence(sequence.nestedAlgs.map(a => this.traverse(a)));
  }
  public traverseGroup(group: Group): Algorithm {
    return new Group(this.traverse(group.nestedAlg), group.amount);
  }
  public traverseBlockMove(blockMove: BlockMove): Algorithm {
    return new BlockMove(blockMove.base, blockMove.amount);
  }
  public traverseCommutator(commutator: Commutator): Algorithm {
    return new Commutator(this.traverse(commutator.A), this.traverse(commutator.B), commutator.amount);
  }
  public traverseConjugate(conjugate: Conjugate): Algorithm {
    return new Conjugate(this.traverse(conjugate.A), this.traverse(conjugate.B), conjugate.amount);
  }
  public traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  public traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  public traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  public traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Invert extends Up<Algorithm> {
  public traverseSequence(sequence: Sequence): Sequence {
    // TODO: Handle newLines and comments correctly
    return new Sequence(sequence.nestedAlgs.slice().reverse().map(a => this.traverse(a)));
  }
  public traverseGroup(group: Group): Algorithm {
    return new Group(this.traverse(group.nestedAlg), group.amount);
  }
  public traverseBlockMove(blockMove: BlockMove): Algorithm {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  public traverseCommutator(commutator: Commutator): Algorithm {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }
  public traverseConjugate(conjugate: Conjugate): Algorithm {
    return new Conjugate(conjugate.A, this.traverse(conjugate.B), conjugate.amount);
  }
  public traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  public traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  public traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  public traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

export class Expand extends Up<Algorithm> {
  private flattenSequenceOneLevel(algList: Algorithm[]): Algorithm[] {
    var flattened: Algorithm[] = [];
    for (var part of algList) {
      if (part instanceof Sequence) {
        flattened = flattened.concat(part.nestedAlgs);
      } else {
        flattened.push(part)
      }
    }
    return flattened;
  }

  private repeat(algList: Algorithm[], accordingTo: Repeatable): Sequence {
    var amount = Math.abs(accordingTo.amount);
    var amountDir = (accordingTo.amount > 0) ? 1 : -1; // Mutable

    // TODO: Cleaner inversion
    var once: Algorithm[];
    if (amountDir == -1) {
      // TODO: Avoid casting to sequence.
      once = (<Sequence>(new Sequence(algList)).invert()).nestedAlgs;
    } else {
      once = algList;
    }

    var repeated: Algorithm[] = [];
    for (var i = 0; i < amount; i++) {
      repeated = repeated.concat(once);
    }

    return new Sequence(repeated);
  }

  public traverseSequence(sequence: Sequence): Sequence {
    return new Sequence(this.flattenSequenceOneLevel(sequence.nestedAlgs.map(a => this.traverse(a))));
  }
  public traverseGroup(group: Group): Algorithm {
    // TODO: Pass raw Algorithm[] to sequence.
    return this.repeat([this.traverse(group.nestedAlg)], group);
  }
  public traverseBlockMove(blockMove: BlockMove): Algorithm {
    return blockMove.clone();
  }
  public traverseCommutator(commutator: Commutator): Algorithm {
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
  public traverseConjugate(conjugate: Conjugate): Algorithm {
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
  public traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  public traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  public traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  public traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
}

export class CountBlockMoves extends Up<number> {
  public traverseSequence(sequence: Sequence): number {
    var total = 0;
    for (var part of sequence.nestedAlgs) {
      total += this.traverse(part);
    }
    return total;
  }
  public traverseGroup(group: Group): number {
    return this.traverse(group.nestedAlg);
  }
  public traverseBlockMove(blockMove: BlockMove): number {
    return 1;
  }
  public traverseCommutator(commutator: Commutator): number {
    return 2*(this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  public traverseConjugate(conjugate: Conjugate): number {
    return 2*(this.traverse(conjugate.A)) + this.traverse(conjugate.B);
  }
  public traversePause(pause: Pause):                      number { return 0; }
  public traverseNewLine(newLine: NewLine):                number { return 0; }
  public traverseCommentShort(commentShort: CommentShort): number { return 0; }
  public traverseCommentLong(commentLong: CommentLong):    number { return 0; }
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
  public traverseGroup(group: Group, dataDown: Algorithm): boolean {
    return (dataDown instanceof Group) && this.traverse(group.nestedAlg, dataDown.nestedAlg);
  }
  public traverseBlockMove(blockMove: BlockMove, dataDown: Algorithm): boolean {
    // TODO: Handle layers.
    return dataDown instanceof BlockMove &&
           blockMove.base === dataDown.base &&
           blockMove.amount === dataDown.amount;
  }
  public traverseCommutator(commutator: Commutator, dataDown: Algorithm): boolean {
    return (dataDown instanceof Commutator) &&
           this.traverse(commutator.A, dataDown.A) &&
           this.traverse(commutator.B, dataDown.B);
  }
  public traverseConjugate(conjugate: Conjugate, dataDown: Algorithm): boolean {
    return (dataDown instanceof Conjugate) &&
           this.traverse(conjugate.A, dataDown.A) &&
           this.traverse(conjugate.B, dataDown.B);
  }
  public traversePause(pause: Pause, dataDown: Algorithm): boolean {
    return dataDown instanceof Pause;
  }
  public traverseNewLine(newLine: NewLine, dataDown: Algorithm): boolean {
    return dataDown instanceof NewLine;
  }
  public traverseCommentShort(commentShort: CommentShort, dataDown: Algorithm): boolean {
    return (dataDown instanceof CommentShort) && (commentShort.comment == dataDown.comment);
  }
  public traverseCommentLong(commentLong: CommentLong, dataDown: Algorithm): boolean {
    return (dataDown instanceof CommentShort) && (commentLong.comment == dataDown.comment);
  }
}

// TODO: Test that inverses are bijections.
export class CoalesceMoves extends Up<Algorithm> {
  private sameBlock(moveA: BlockMove, moveB: BlockMove): boolean {
    // TODO: Handle layers
    return moveA.base === moveB.base;
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
          var amount = last.amount + part.amount;
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
  public traverseGroup(group: Group):                      Algorithm { return group.clone(); }
  public traverseBlockMove(blockMove: BlockMove):          Algorithm { return blockMove.clone(); }
  public traverseCommutator(commutator: Commutator):       Algorithm { return commutator.clone(); }
  public traverseConjugate(conjugate: Conjugate):          Algorithm { return conjugate.clone(); }
  public traversePause(pause: Pause):                      Algorithm { return pause.clone(); }
  public traverseNewLine(newLine: NewLine):                Algorithm { return newLine.clone(); }
  public traverseCommentShort(commentShort: CommentShort): Algorithm { return commentShort.clone(); }
  public traverseCommentLong(commentLong: CommentLong):    Algorithm { return commentLong.clone(); }
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
  public traverseSequence(     sequence:     Sequence,     dataDown: Algorithm): Sequence {return this.concatIntoSequence(sequence.nestedAlgs, dataDown); }
  public traverseGroup(        group:        Group,        dataDown: Algorithm): Sequence {return this.concatIntoSequence([group]          , dataDown); }
  public traverseBlockMove(    blockMove:    BlockMove,    dataDown: Algorithm): Sequence {return this.concatIntoSequence([blockMove]      , dataDown); }
  public traverseCommutator(   commutator:   Commutator,   dataDown: Algorithm): Sequence {return this.concatIntoSequence([commutator]     , dataDown); }
  public traverseConjugate(    conjugate:    Conjugate,    dataDown: Algorithm): Sequence {return this.concatIntoSequence([conjugate]      , dataDown); }
  public traversePause(        pause:        Pause,        dataDown: Algorithm): Sequence {return this.concatIntoSequence([pause]          , dataDown); }
  public traverseNewLine(      newLine:      NewLine,      dataDown: Algorithm): Sequence {return this.concatIntoSequence([newLine]        , dataDown); }
  public traverseCommentShort( commentShort: CommentShort, dataDown: Algorithm): Sequence {return this.concatIntoSequence([commentShort]   , dataDown); }
  public traverseCommentLong(  commentLong:  CommentLong,  dataDown: Algorithm): Sequence {return this.concatIntoSequence([commentLong]    , dataDown); }
}

export class ToString extends Up<string> {
  private repetitionSuffix(amount: number): string {
    var absAmount = Math.abs(amount);
    var s = "";
    if (absAmount !== 1) {
      s += String(absAmount)
    }
    if (absAmount !== amount) {
      s += "'"
    }
    return s;
  }
  public traverseSequence(     sequence:     Sequence,     ): string { return sequence.nestedAlgs.map(a => this.traverse(a)).join(" "); }
  public traverseGroup(        group:        Group,        ): string { return "(" + group.nestedAlg + ")" + this.repetitionSuffix(group.amount); }
  public traverseBlockMove(    blockMove:    BlockMove,    ): string { return blockMove.base + this.repetitionSuffix(blockMove.amount); }
  public traverseCommutator(   commutator:   Commutator,   ): string { return "[" + commutator.A + ", " + commutator.B + "]" + this.repetitionSuffix(commutator.amount); }
  public traverseConjugate(    conjugate:    Conjugate,    ): string { return "[" + conjugate.A + ": " + conjugate.B + "]" + this.repetitionSuffix(conjugate.amount); }
  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  public traversePause(        pause:        Pause,        ): string { return "."; }
  public traverseNewLine(      newLine:      NewLine,      ): string { return "\n"; }
  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseCommentShort( commentShort: CommentShort, ): string { return "//" + commentShort.comment; }
    // TODO: Sanitize `*/`
  public traverseCommentLong(  commentLong:  CommentLong,  ): string { return "/*" + commentLong.comment + "*/"; }
}

export namespace Singleton {
  export const clone           = new Clone();
  export const invert          = new Invert();
  export const expand          = new Expand();
  export const countBlockMoves = new CountBlockMoves();
  export const structureEquals = new StructureEquals();
  export const coalesceMoves   = new CoalesceMoves();
  export const concat          = new Concat();
  export const toString        = new ToString();
}

}
}