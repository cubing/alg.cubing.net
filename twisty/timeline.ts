"use strict";

namespace Twisty {

export class TimeLine {
  public breakPointModel: Anim.BreakPointModel;
  constructor() {
    this.breakPointModel = new Anim.SimpleBreakPoints([0, 1000, 1500, 2500]);
  }
}
}