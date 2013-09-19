
var alg = (function (){

  var debug = false;

  var patterns = {
    single: /^[UFRBLD]$/,
    wide: /^([ufrbld])|([UFRBLD]w)$/,
    slice: /^[MES]$/,
    rotation: /^[xyz]$/
  };

  var directionMap = {
    "U": "U", "Uw": "U", "u": "U",           "y": "U",
    "F": "F", "Fw": "F", "f": "F", "S": "F", "z": "F",
    "R": "R", "Rw": "R", "r": "R",           "x": "R",
    "B": "B", "Bw": "B", "b": "B",
    "L": "L", "Lw": "L", "l": "L", "M": "L",
    "D": "D", "Dw": "D", "d": "D", "E": "D",
    ".": "."
  };

  function canonicalizeMove(orig) {
    var move = {};

    move.amount = orig.amount;
    move.base = directionMap[orig.base];

    if (patterns.single.test(orig.base)) {
      move.startLayer = orig.layer || 1;
      move.endLayer = move.startLayer;
    } else if (patterns.wide.test(orig.base)) {
      move.startLayer = orig.startLayer || 1;
      move.endLayer = orig.endLayer || 2;
    } else if (patterns.slice.test(orig.base)) {
      move.startLayer = 2;
      move.endLayer = -2;
    } else if (patterns.rotation.test(orig.base)) {
      move.startLayer = 1;
      move.endLayer = -1;
    }

    return move;
  }

  var sign_w = (function(){

    function algSimplify(alg) {
      var algOut = [];
      for (var i = 0; i < alg.length; i++) {
        var move = alg[i];
        if (algOut.length > 0 &&
            algOut[algOut.length-1].startLayer == move.startLayer &&
            algOut[algOut.length-1].endLayer == move.endLayer &&
            algOut[algOut.length-1].base == move.base) {
          algOut[algOut.length-1].amount += move[3];
          algOut[algOut.length-1].amount = (((algOut[algOut.length-1][3] + 1 % 4) + 4) % 4) -1; // TODO: R2'
          if (algOut[algOut.length-1].amount == 0) {
            algOut.pop();
          }
        }
        else {
          algOut.push(cloneMove(move));
        }
        //console.log(JSON.stringify(algOut));
      }
      return algOut;
    }

    var repeatableToString = {}

    repeatableToString["move"] = function(move) {
        var tL = move.layer;
        var sL = move.startLayer;
        var oL = move.endLayer;

        var prefix = "";

        // Prefix logic
        if (patterns.single.test(move.base)) {
          if (move.layer) {
            prefix = move.layer.toString();
          }
        } else if (patterns.wide.test(move.base)) {
          if (move.endLayer) {
            prefix = move.endLayer.toString();
            if (move.startLayer) {
              prefix = move.startLayer.toString() + "-" + prefix;
            }
          }
        }

        return prefix + move.base;
    }

    repeatableToString["commutator"] = function(commutator) {
      return "[" + algToString(commutator.A) + ", " + algToString(commutator.B) + "]";
    }

    repeatableToString["conjugate"] = function(commutator) {
      return "[" + algToString(commutator.A) + ", " + algToString(commutator.B) + "]";
    }

    repeatableToString["group"] = function(group) {
      return "(" + algToString(group.A) + ")";
    }

    function suffix(repeated) {

      var amount = Math.abs(repeated.amount);
      var amountDir = (repeated.amount > 0) ? 1 : -1; // Mutable

      var suffix = ""
      // Suffix Logic
      if (amount > 1) {
        suffix += "" + amount;
      }

      if (amountDir === -1) {
        suffix += "'";
      }
      return suffix;
    }

    function algToString(algIn, dimension) {
      var alg = algSimplify(algIn);

      var moveStrings = [];
      for (i in alg) {
        var moveString = repeatableToString[alg[i].type](alg[i]) + suffix(alg[i]);
        moveStrings.push(moveString);
      }
      return moveStrings.join(" ");
    }

    function cloneMove(move) {
      var newMove = {};
      for (i in move) {
        newMove[i] = move[i]
      }
      return newMove;
    }

    function invert(algIn) {
      var algInverse = [];
      for (i in algIn) {
        var move = cloneMove(algIn[i]);
        move.amount *= -1;
        algInverse.push(move);
      }
      return algInverse.reverse();
    }

    function repeatMoves(movesIn, accordingTo) {

      var movesOnce = movesIn;

      var amount = Math.abs(accordingTo.amount);
      var amountDir = (accordingTo.amount > 0) ? 1 : -1; // Mutable

      if (amountDir == -1) {
        movesOnce = invert(movesOnce);
      }

      var movesOut = [];
      for (var i = 0; i < amount; i++) {
        movesOut = movesOut.concat(movesOnce);
      }

      return movesOut;
    }

    var repeatableToMoves = {};

    repeatableToMoves["move"] = function(move) {
      return [move];
    }

    repeatableToMoves["commutator"] = function(commutator) {
      var once = [].concat(
        algToMoves(commutator.A),
        algToMoves(commutator.B),
        invert(algToMoves(commutator.A)),
        invert(algToMoves(commutator.B))
      );
      return repeatMoves(once, commutator);
    }

    repeatableToMoves["conjugate"] = function(conjugate) {
      var once = [].concat(
        algToMoves(conjugate.A),
        algToMoves(conjugate.B),
        invert(algToMoves(conjugate.A))
      );
      return repeatMoves(once, conjugate);
    }

    repeatableToMoves["group"] = function(group) {
      var once = algToMoves(group.A);
      return repeatMoves(once, group);
    }

    function algToMoves(algIn) {
      var moves = [];
      for (i in algIn) {
        moves = moves.concat(repeatableToMoves[algIn[i].type](algIn[i]));
      }
      return moves;
    }

    function stringToAlg(algString) {
      return sign_w_jison.parse(algString);
    }

    return {
      algToString: algToString,
      stringToAlg: stringToAlg,
      invert: invert,
      canonicalizeMove: canonicalizeMove,
      algToMoves: algToMoves
    }
  })();

  return {
    sign_w: sign_w
  }
})();