# alg.js

A library for parsing and transforming puzzle algorithms ("algs"). Spinout project from [twisty.js](https://github.com/cubing/twisty.js).

This currently only parses SiGNw notation for cubes. It will handle more puzzles in the future.


## Install

    > npm install alg

Or include `alg.js` and `alg_jison.js` in an HTML page.


## Simple Usage

    > var alg = require("alg");
    > alg.cube.invert("[R, U] R' F R2 U' R' U' R U R' F'")
      "F R U' R' U R U R2' F' R [U, R]"

Useful methods include:

- `simplify`
- `invert`
- `mirrorAcrossM`
- `mirrorAcrossS`
- `expand`
- `countMoves`


## Parsing to JSON

    > var alg = require("alg");
    > alg.cube.fromString("R U R'")
    [ { type: 'move',
        base: 'R',
        amount: 1,
        location:
         { first_line: 1,
           last_line: 1,
           first_column: 0,
           last_column: 1 } },
      { type: 'move',
        base: 'U',
        amount: 1,
        location:
         { first_line: 1,
           last_line: 1,
           first_column: 2,
           last_column: 3 } },
      { type: 'move',
        base: 'R',
        amount: -1,
        location:
         { first_line: 1,
           last_line: 1,
           first_column: 4,
           last_column: 6 } } ]

JSON algs contain the following types of nodes:

- `sequence`
- `move`
- `commutator`
- `conjugate`
- `group`
- `pause`
- `newline`
- `comment_short`
- `comment_long`
- `timestamp`

(TODO: provide a full [JSON schema](http://json-schema.org/) somewhere.)


## Transformation API

    > var alg = require("alg");
    > doubleEachMove = alg.cube.makeAlgTraversal();
    > doubleEachMove.move = function(move) {
        var newMove = alg.cube.cloneMove(move);
        newMove.amount *= 2;
        return newMove;
      }
    > doubleEachMove("R U R' U R U2 R'")
      "R2 U2 R2' U2 R2 U4 R2'"
