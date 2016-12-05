"use strict";

namespace Alg {
export namespace Traversal {

export abstract class DownUp<DataDown, DataUp> {
  // Immediate subclasses should overwrite this.
  public traverse(segment: AlgPart, dataDown: DataDown): DataUp {
    return this.traverseGeneric(segment, dataDown);
  }

  // A generic version of traverse that should not be overwritten.
  protected traverseGeneric(segment: AlgPart, dataDown: DataDown): DataUp {
    // TODO: Use a direct look up using e.g. hashmap instead of sequential if-else.
    // TODO: Clone arguments by default, for safety.
         if (segment instanceof Sequence)       { return this.traverseSequence(segment, dataDown); }
    else if (segment instanceof Group)          { return this.traverseGroup(segment, dataDown); }
    else if (segment instanceof BlockMove)      { return this.traverseBlockMove(segment, dataDown); }
    else if (segment instanceof Commutator)     { return this.traverseCommutator(segment, dataDown); }
    else if (segment instanceof Conjugate)      { return this.traverseConjugate(segment, dataDown); }
    else if (segment instanceof Pause)          { return this.traversePause(segment, dataDown); }
    else if (segment instanceof Newline)        { return this.traverseNewline(segment, dataDown); }
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
  protected abstract traverseNewline(newline: Newline, dataDown: DataDown): DataUp;
  protected abstract traverseCommentShort(commentShort: CommentShort, dataDown: DataDown): DataUp;
  protected abstract traverseCommentLong(commentLong: CommentLong, dataDown: DataDown): DataUp;
}

export abstract class Up<DataUp> extends DownUp<undefined, DataUp> {
  public traverse(segment: AlgPart): DataUp {
    return this.traverseGeneric.call(this, segment);
  }

  protected abstract traverseSequence(sequence: Sequence): DataUp;
  protected abstract traverseGroup(group: Group): DataUp;
  protected abstract traverseBlockMove(blockMove: BlockMove): DataUp;
  protected abstract traverseCommutator(commutator: Commutator): DataUp;
  protected abstract traverseConjugate(conjugate: Conjugate): DataUp;
  protected abstract traversePause(pause: Pause): DataUp;
  protected abstract traverseNewline(newline: Newline): DataUp;
  protected abstract traverseCommentShort(commentShort: CommentShort): DataUp;
  protected abstract traverseCommentLong(commentLong: CommentLong): DataUp;
};
export abstract class OfAlgPart extends Up<AlgPart> {};

export class Clone extends OfAlgPart {
  public traverseSequence(sequence: Sequence): Sequence {
    return new Sequence(sequence.algParts.map(this.traverse));
  }
  protected traverseGroup(group: Group): AlgPart {
    return new Group(this.traverse(group.algPart), group.amount);
  }
  protected traverseBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, blockMove.amount);
  }
  protected traverseCommutator(commutator: Commutator): AlgPart {
    return new Commutator(this.traverse(commutator.A), this.traverse(commutator.B), commutator.amount);
  }
  protected traverseConjugate(conjugate: Conjugate): AlgPart {
    return new Conjugate(this.traverse(conjugate.A), this.traverse(conjugate.B), conjugate.amount);
  }
  protected traversePause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected traverseNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Invert extends OfAlgPart {
  public traverseSequence(sequence: Sequence): Sequence {
    // TODO: Handle newlines and comments correctly
    return new Sequence(sequence.algParts.reverse().map(this.traverse));
  }
  protected traverseGroup(group: Group): AlgPart {
    return new Group(this.traverse(group.algPart), group.amount);
  }
  protected traverseBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  protected traverseCommutator(commutator: Commutator): AlgPart {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }
  protected traverseConjugate(conjugate: Conjugate): AlgPart {
    return new Conjugate(conjugate.A, this.traverse(conjugate.B), conjugate.amount);
  }
  protected traversePause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected traverseNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

// TODO: Test that inverses are bijections.
export class Expand extends OfAlgPart {
  private repeat(algParts: AlgPart[], accordingTo: Repeatable): Sequence {
    var amount = Math.abs(accordingTo.amount);
    var amountDir = (accordingTo.amount > 0) ? 1 : -1; // Mutable

    // TODO: Cleaner inversion
    var directedAlgParts: AlgPart[];
    if (amountDir == -1) {
      // TODO: Avoid casting to sequence.
      directedAlgParts = (<Sequence>(new Sequence(algParts)).invert()).algParts;
    } else {
      directedAlgParts = algParts;
    }

    var repeatedParts: AlgPart[] = [];
    for (var i = 0; i < amount; i++) {
      repeatedParts = repeatedParts.concat(directedAlgParts);
    }

    return new Sequence(repeatedParts);
  }

  public traverseSequence(sequence: Sequence): Sequence {
    // TODO: Handle newlines and comments correctly
    return new Sequence(sequence.algParts.map(this.traverse));
  }
  protected traverseGroup(group: Group): AlgPart {
    // TODO: Pass raw AlgPArts[] to sequence.
    return this.repeat([this.traverse(group.algPart)], group);
  }
  protected traverseBlockMove(blockMove: BlockMove): AlgPart {
    return new BlockMove(blockMove.base, -blockMove.amount);
  }
  protected traverseCommutator(commutator: Commutator): AlgPart {
    var once: AlgPart[] = [];
    once = once.concat(
      commutator.A,
      commutator.B,
      commutator.A.invert(),
      commutator.B.invert()
    );
    return this.repeat(once, commutator);
  }
  protected traverseConjugate(conjugate: Conjugate): AlgPart {
    var once: AlgPart[] = [];
    once = once.concat(
      conjugate.A,
      conjugate.B,
      conjugate.A.invert()
    );
    return this.repeat(once, conjugate);
  }
  protected traversePause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected traverseNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

export class CountBlockMoves extends Up<number> {
  public traverseSequence(sequence: Sequence): number {
    return 1;
  }
  protected traverseGroup(group: Group): number {
    return 1;
  }
  protected traverseBlockMove(blockMove: BlockMove): number {
    return 1;
  }
  protected traverseCommutator(commutator: Commutator): number {
    return 1;
  }
  protected traverseConjugate(conjugate: Conjugate): number {
    return 1;
  }
  protected traversePause(pause: Pause):                      number { return 0; }
  protected traverseNewline(newline: Newline):                number { return 0; }
  protected traverseCommentShort(commentShort: CommentShort): number { return 0; }
  protected traverseCommentLong(commentLong: CommentLong):    number { return 0; }
}

}
}