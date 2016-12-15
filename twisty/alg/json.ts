"use strict";

namespace Alg {

export interface AlgorithmJSON {
  type: string;
  nestedAlg?: AlgorithmJSON;
  nestedAlgs?: AlgorithmJSON[];
  base?: string;
  amount?: number;
  A?: AlgorithmJSON;
  B?: AlgorithmJSON;
  comment?: string;
}

// TODO: Implement using Traversal?
export function fromJSON(json: AlgorithmJSON): Algorithm {
  switch (json.type) {
    case "sequence":
      if (!json.nestedAlgs) { throw "Missing nestedAlgs" }
      return new Sequence(json.nestedAlgs.map(j => this.fromJSON(j)));
    case "group":
      if (!json.nestedAlg) { throw "Missing nestedAlg" }
      if (!json.amount) { throw "Missing amount" }
      return new Group(this.fromJSON(json.nestedAlg), json.amount);
    case "blockMove":
      // TODO: Handle layers
      if (!json.base) { throw "Missing base" }
      if (!json.amount) { throw "Missing amount" }
      return new BlockMove(json.base, json.amount);
    case "commutator":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Commutator(this.fromJSON(json.A), this.fromJSON(json.B), json.amount);
    case "conjugate":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Conjugate(this.fromJSON(json.A), this.fromJSON(json.B), json.amount);
    case "pause":
      return new Pause();
    case "newLine":
      return new NewLine();
    case "commentShort":
      if (!json.comment) { throw "Missing comment" }
      return new CommentShort(json.comment);
    case "commentLong":
      if (!json.comment) { throw "Missing comment" }
      return new CommentLong(json.comment);
    default:
      throw "Unknown alg type.";
  }
}

}
