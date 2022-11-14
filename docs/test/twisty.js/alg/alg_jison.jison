
/* lexical grammar */
%lex
%s timestamp
%%


"@"                               { this.begin("timestamp"); return 'AT' }
<timestamp>[0-9]+("."[0-9]+)?     return 'FLOAT'
<timestamp>"s"                    { this.popState(); return 'SECONDS' }

[^\S\r\n]+             return "WHITESPACE"
[0-9]+                 return "NUMBER"
"-"                    return "DASH"

(Rw|Fw|Uw|Bw|Lw|Dw)    return "BASE_W"
(R|F|U|B|L|D)          return "BASE_UPPERCASE"
(r|f|u|b|l|d)          return "BASE_LOWERCASE"
(x|y|z)                return "BASE_ROTATION"
(M|N|E|S)              return "BASE_SLICE"

"'"                    return "PRIME"
"."                    return "PAUSE"

"//"[^\n\r]*           return "COMMENT_SHORT"
"/*"[^]*?"*/"          return "COMMENT_LONG"
[\n\r]                 return "NEWLINE"

"["                    return "OPEN_BRACKET"
"]"                    return "CLOSE_BRACKET"
"("                    return "OPEN_PARENTHESIS"
")"                    return "CLOSE_PARENTHESIS"
","                    return "COMMA"
":"                    return "COLON"

<<EOF>>                return "EOF"
.                      return "INVALID"

/lex

%% /* language grammar */

expressions
    : TOP_LEVEL_ALG EOF
        { return $TOP_LEVEL_ALG; }
    | OPTIONAL_WHITESPACE EOF
        { return []; }
    ;

LAYER
    : NUMBER
        {$$ = parseInt($NUMBER);}
    ;

REPETITION
    : NUMBER
        {$$ = parseInt($NUMBER);}
    ;

AMOUNT
    : REPETITION
    | REPETITION PRIME
        {$$ = -$REPETITION;}
    | PRIME
        {$$ = -1;}
    ;

COMMENT
    : COMMENT_SHORT
        {$$ = {type: "comment_short", comment: $COMMENT_SHORT};}
    | COMMENT_LONG
        {$$ = {type: "comment_long", comment: $COMMENT_LONG};}
    ;

BASE_WIDE
    : BASE_W
    | BASE_LOWERCASE
    ;

BASE
    : BASE_WIDE
    | BASE_UPPERCASE
    | BASE_ROTATION
    | BASE_SLICE
    ;

BLOCK
    : BASE
        {$$ = {type: "move", base: $BASE};}
    | LAYER BASE_UPPERCASE
        {$$ = {type: "move", base: $BASE_UPPERCASE, layer: $LAYER};}
    | LAYER BASE_WIDE
        {$$ = {type: "move", base: $BASE_WIDE, endLayer: $LAYER};}
    | LAYER DASH LAYER BASE_WIDE
        {$$ = {type: "move", base: $BASE_WIDE, startLayer: $1, endLayer: $3};}
    ;

TIMESTAMP
    : AT FLOAT SECONDS
        {$$ = {type: "timestamp", time: parseFloat($2)};}
    ;

OPTIONAL_WHITESPACE
    : WHITESPACE
    | /* nothing */
    | OPTIONAL_WHITESPACE OPTIONAL_WHITESPACE
    ;

REPEATABLE
    : BLOCK
    | OPEN_BRACKET NESTED_ALG COMMA NESTED_ALG CLOSE_BRACKET
        {$$ = {"type": "commutator", "A": $2, "B": $4};}
    | OPEN_BRACKET NESTED_ALG COLON NESTED_ALG CLOSE_BRACKET
        {$$ = {"type": "conjugate", "A": $2, "B": $4};}
    | OPEN_PARENTHESIS NESTED_ALG CLOSE_PARENTHESIS
        {$$ = {"type": "group", "A": $NESTED_ALG};}
    ;

REPEATED
    : REPEATABLE
        {$REPEATABLE.amount = 1; $$ = $REPEATABLE;}
    | REPEATABLE AMOUNT
        {$REPEATABLE.amount = $AMOUNT; $$ = $REPEATABLE;}
    | PAUSE
        {$$ = {type: "pause"};}
    | NEWLINE
        {$$ = {type: "newline"};}
    | COMMENT
    ;

NESTED_ALG
    : OPTIONAL_WHITESPACE REPEATED OPTIONAL_WHITESPACE
        {$$ = [$REPEATED]; $REPEATED.location = @REPEATED;}
    | NESTED_ALG NESTED_ALG
        {$$ = $1.concat($2);}
    ;

TOP_LEVEL_ALG
    : NESTED_ALG
    | OPTIONAL_WHITESPACE TIMESTAMP OPTIONAL_WHITESPACE
        {$$ = [$TIMESTAMP]; $TIMESTAMP.location = @TIMESTAMP;}
    | TOP_LEVEL_ALG TOP_LEVEL_ALG
        {$$ = $1.concat($2);}
    ;