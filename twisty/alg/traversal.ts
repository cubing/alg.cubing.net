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
    return new Sequence(sequence.algParts.map(a => this.traverse(a)));
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
    return new Sequence(sequence.algParts.slice().reverse().map(a => this.traverse(a)));
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

export class Expand extends OfAlgPart {
  private flattenSequenceOneLevel(algParts: AlgPart[]): AlgPart[] {
    var flattened: AlgPart[] = [];
    for (var part of algParts) {
      if (part instanceof Sequence) {
        flattened = flattened.concat(part.algParts);
      } else {
        flattened.push(part)
      }
    }
    return flattened;
  }

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
    return new Sequence(this.flattenSequenceOneLevel(sequence.algParts.map(this.traverse)));
  }
  protected traverseGroup(group: Group): AlgPart {
    // TODO: Pass raw AlgPArts[] to sequence.
    return this.repeat([this.traverse(group.algPart)], group);
  }
  protected traverseBlockMove(blockMove: BlockMove): AlgPart {
    return blockMove.clone();
  }
  protected traverseCommutator(commutator: Commutator): AlgPart {
    var expandedA = this.traverse(commutator.A)
    var expandedB = this.traverse(commutator.B)
    var once: AlgPart[] = [];
    once = once.concat(
      expandedA,
      expandedB,
      expandedA.invert(),
      expandedB.invert()
    );
    return this.repeat(this.flattenSequenceOneLevel(once), commutator);
  }
  protected traverseConjugate(conjugate: Conjugate): AlgPart {
    var expandedA = this.traverse(conjugate.A)
    var expandedB = this.traverse(conjugate.B)
    var once: AlgPart[] = [];
    once = once.concat(
      expandedA,
      expandedB,
      expandedA.invert()
    );
    return this.repeat(this.flattenSequenceOneLevel(once), conjugate);
  }
  protected traversePause(pause: Pause):                      AlgPart { return pause.clone(); }
  protected traverseNewline(newline: Newline):                AlgPart { return newline.clone(); }
  protected traverseCommentShort(commentShort: CommentShort): AlgPart { return commentShort.clone(); }
  protected traverseCommentLong(commentLong: CommentLong):    AlgPart { return commentLong.clone(); }
}

export class CountBlockMoves extends Up<number> {
  public traverseSequence(sequence: Sequence): number {
    var total = 0;
    for (var part of sequence.algParts) {
      total += this.traverse(part);
    }
    return total;
  }
  protected traverseGroup(group: Group): number {
    return this.traverse(group.algPart);
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
  protected traverseNewline(newline: Newline):                number { return 0; }
  protected traverseCommentShort(commentShort: CommentShort): number { return 0; }
  protected traverseCommentLong(commentLong: CommentLong):    number { return 0; }
}

export class StructureEquals extends DownUp<AlgPart, boolean> {
  public traverseSequence(sequence: Sequence, dataDown: AlgPart): boolean {
    if (!(dataDown instanceof Sequence)) {
      return false;
    }
    if (sequence.algParts.length !== dataDown.algParts.length) {
      return false;
    }
    for (var i = 0; i < sequence.algParts.length; i++) {
      if (!this.traverse(sequence.algParts[i], dataDown.algParts[i])) {
        return false;
      }
    }
    return true;
  }
  protected traverseGroup(group: Group, dataDown: AlgPart): boolean {
    return (dataDown instanceof Group) && this.traverse(group.algPart, dataDown.algPart);
  }
  protected traverseBlockMove(blockMove: BlockMove, dataDown: AlgPart): boolean {
    // TODO: Handle layers.
    return dataDown instanceof BlockMove &&
           blockMove.base === dataDown.base &&
           blockMove.amount === dataDown.amount;
  }
  protected traverseCommutator(commutator: Commutator, dataDown: AlgPart): boolean {
    return (dataDown instanceof Commutator) &&
           this.traverse(commutator.A, dataDown.A) &&
           this.traverse(commutator.B, dataDown.B);
  }
  protected traverseConjugate(conjugate: Conjugate, dataDown: AlgPart): boolean {
    return (dataDown instanceof Conjugate) &&
           this.traverse(conjugate.A, dataDown.A) &&
           this.traverse(conjugate.B, dataDown.B);
  }
  protected traversePause(pause: Pause, dataDown: AlgPart): boolean {
    return dataDown instanceof Pause;
  }
  protected traverseNewline(newline: Newline, dataDown: AlgPart): boolean {
    return dataDown instanceof Newline;
  }
  protected traverseCommentShort(commentShort: CommentShort, dataDown: AlgPart): boolean {
    return (dataDown instanceof CommentShort) && (commentShort.comment == dataDown.comment);
  }
  protected traverseCommentLong(commentLong: CommentLong, dataDown: AlgPart): boolean {
    return (dataDown instanceof CommentShort) && (commentLong.comment == dataDown.comment);
  }
}

export const cloneTraversal:           Clone           = new Clone();
export const invertTraversal:          Invert          = new Invert();
export const expandTraversal:          Expand          = new Expand();
export const countBlockMovesTraversal: CountBlockMoves = new CountBlockMoves();
export const structureEqualsTraversal: StructureEquals = new StructureEquals();

}
}