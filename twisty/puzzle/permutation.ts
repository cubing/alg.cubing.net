"use strict";

namespace Twisty {
export namespace Puzzle {

interface Position {
  inverse(): Position
  thenApply(q: Position): Position
}

export class Z8 implements Position {
  private value: number;
  constructor(value: number | null) {
    if (value === null) {
      this.value = 1;
    } else {
      this.value = value;
    }
  }
  inverse(): Z8 {
    return new Z8(7 - this.value);
  }
  thenApply(q: Z8): Z8 {
    var z: Z8 = new Z8(q.value + this.value);
    return z;
  }
}

}
}
