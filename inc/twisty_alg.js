
var alg = (function (){

  var debug = false;

  var sign_w = (function(){
  
    //TODO 20110906: Slice moves.
    // Note: we need to use direct regexp syntax instead of the RegExp constructor,
    // else we seem to lose longest matches.
    var pattern = /(((\d*)-)?(\d*)([UFRBLDufrbldxyz]w?)([\d]*)('?)|((\/\/)|(\/\*)|(\*\/)|(\n)|(\.)))/g;
    var pattern_move = /^((\d*)-)?(\d*)([UFRBLDufrbldxyz]w?)([\d]*)('?)$/;

    var move_uppercase = /^[UFRBLD]$/;
    var move_lowercase = /^[ufrbld]$/;
    var move_wide = /^[UFRBLD]w$/;
    var move_rotation = /^[xyz]$/;

    function stringToMove(moveString) {

      if (debug) console.log("[Move] " + moveString);
      
      var parts = pattern_move.exec(moveString);
      if (debug) console.log(parts);

      var outStartSlice = 1;
      var outEndSlice = 1; 
      var baseMove = parts[4]; 
      var amount = 1;

      if (move_uppercase.test(baseMove)) {
        var outEndSliceParsed = parseInt(parts[3]);
        if (!isNaN(outEndSliceParsed )) {
          outStartSlice = outEndSliceParsed;
          outEndSlice = outEndSliceParsed;
        }
      }

      if (move_lowercase.test(baseMove) ||
          move_wide.test(baseMove)) {

        baseMove = baseMove[0].toUpperCase();
        outEndSlice = 2;

        var outEndSliceParsed = parseInt(parts[3]);
        if (!isNaN(outEndSliceParsed )) {
          outEndSlice = outEndSliceParsed;
        }

        var outStartSliceParsed = parseInt(parts[2]);
        if (!isNaN(outStartSliceParsed )) {
          outStartSlice = outStartSliceParsed ;
        }
      }

      if (move_rotation.test(baseMove)) {
     
        outStartSlice = 1;
        outEndSlice = -1;
        
        var sliceMap = {"x": "R", "y": "U", "z": "F"};
        
        baseMove = sliceMap[baseMove];
        
      }
      
      /* Amount */
      
      var amountParsed = parseInt(parts[5]);
      if (!isNaN(amountParsed)) {
        amount = amountParsed;
      }
      if (parts[6] == "'") {
        amount *= -1;
      }
      
      /* Return */
      
      return [outStartSlice, outEndSlice, baseMove, amount];
      
    }

    function stringToAlg(algString) {
      
      var moveStrings = algString.match(pattern);
      var alg = [];
      
      if (debug) console.log(moveStrings);
      
      var inLineComment = false;
      var inLongComment = false;

      for (i in moveStrings) {


        if (moveStrings[i] === "//") { inLineComment = true; continue; }
        if (moveStrings[i] === "\n") { inLineComment = false; alg.push([1, 1, ".", 1]); continue; }
        if (moveStrings[i] === ".")  { alg.push([1, 1, ".", 1]); continue; }
        if (moveStrings[i] === "/*") { inLongComment = true; continue; }
        if (moveStrings[i] === "*/") { 
          if (debug && !inLongComment) { console.err("Closing a comment that wasn't opened!");}
          inLongComment = false;
          continue;
        }
        if (inLineComment || inLongComment) { continue; }

        var move = stringToMove(moveStrings[i]);
        alg.push(move);
      }
      
      if (debug) console.log(alg);
      
      return alg;
      
    }

    function algSimplify(alg) {
      var algOut = [];
      for (var i = 0; i < alg.length; i++) {
        var move = alg[i];
        if (algOut.length > 0 &&
            algOut[algOut.length-1][0] == move[0] &&
            algOut[algOut.length-1][1] == move[1] &&
            algOut[algOut.length-1][2] == move[2]) {
          algOut[algOut.length-1][3] += move[3];
          algOut[algOut.length-1][3] = (((algOut[algOut.length-1][3] + 1 % 4) + 4) % 4) -1; // TODO: R2'
          if (algOut[algOut.length-1][3] == 0) {
            algOut.pop();
          }
        }
        else {
          algOut.push(move.slice(0));
        }
        //console.log(JSON.stringify(algOut));
      }
      return algOut;
    }

    function algToString(algIn, dimension) {

      var alg = algSimplify(algIn);
      
      var moveStrings = [];
      for (i in alg) {

        var iS = alg[i][0];
        var oS = alg[i][1];
        var move = alg[i][2];
        var amount = Math.abs(alg[i][3]);
        var amountDir = (alg[i][3] > 0) ? 1 : -1; // Mutable

        var moveString = "";

        // Move logic
        if (iS == 1 && oS == 1) {
          moveString += move;
        }
        else if (iS == 1 && oS == dimension) {
          var rotationMap = {
            "U": ["y", 1],
            "F": ["z", 1],
            "R": ["x", 1],
            "B": ["z", -1],
            "L": ["x", -1],
            "D": ["y", -1],
          }
          moveString += rotationMap[move][0];
          amountDir *= rotationMap[move][1];
        }
        else if (iS == 1 && oS == 2) {
          moveString += move.toLowerCase();
        }
        else if (dimension == 3 && iS == 2 && oS == 2) {
          var sliceMap = {
            "U": ["E", -1],
            "F": ["S", 1],
            "R": ["M", -1],
            "B": ["S", -1],
            "L": ["M", 1],
            "D": ["E", 1],
          }
          moveString += sliceMap[move][0];
          amountDir *= sliceMap[move][1];
        }
        else if (iS == 1) {
          moveString += oS + move.toLowerCase();
        }
        else if (iS == oS) {
          moveString += iS + move;
        }
        else {
          // TODO: Negative indices.
          moveString += iS + "-" + oS + move.toLowerCase();
        }

        // Suffix Logic
        var suffix = "";
        if (amount == 0) {
          continue;
        }
        if (amount > 1) {
          suffix += "" + amount;
        }
        if (alg[i][3] < 0) {
          suffix += "'";
        }

        moveString += suffix;
        moveStrings.push(moveString);
      }
      return moveStrings.join(" ");
    }

    function invert(algIn) {
      var algInverse = [];
      for (i in algIn) {
        var move = algIn[i].slice(0); // Copy array.
        move[3] *= -1;
        algInverse.push(move);
      }
      return algInverse.reverse();
    }

    return {
      algToString: algToString,
      stringToAlg: stringToAlg,
      invert: invert
    }
  })();

  return {
    sign_w: sign_w
  }
})();