ace.define("ace/mode/pscheme_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var SchemeHighlightRules = function() {
    var keywordControl = "if|else|cond|let|begin|error|newline|display";// red control flow
    var keywordOperator = "eq?|eqv?|equal?|and|or|not|cons";// red operators
    var constantLanguage = "#t|#f|pi";// purple constant
    var supportFunctions = "null?|pair?|apply|eval";// blue functions
    supportFunctions += "|set!|set-car!|set-cdr!|reverse|length|map|append";
    supportFunctions += "|exp|max|min|abs|floor|ceiling|expt|sqrt";

    var keywordMapper = this.createKeywordMapper({
        "keyword.control": keywordControl,
        "keyword.operator": keywordOperator,
        "constant.language": constantLanguage,
        "support.function": supportFunctions
    }, "identifier", true);

    var validNameRegex = "[a-zA-Z_#][a-zA-Z0-9_\\-\\?\\!\\*]*";

    this.$rules = {
    "start": [
        {
            // grey comment
            token: "comment",
            regex: ";.*$"
        },
        {
            // blue italics list
            token: ["storage.type.function-type.scheme"],
            regex: "list",
        },
        {
            token: ["storage.type.function-type.scheme"],
            regex: "define",
            next: "declaration"
        },
        {
            // blue italics lambda
            token: ["storage.type.function-type.scheme"],
            regex: "lambda",
            next: "paramlist"
        },
        {
            // purple constant #:something
            token: "punctuation.definition.constant.character.scheme",
            regex: "#:\\S+"
        },
        {
            // green *something*
            token: ["punctuation.definition.variable.scheme", "variable.other.global.scheme", "punctuation.definition.variable.scheme"],
            regex: "(\\*)(\\S*)(\\*)"
        },
        // {
        //     // green lambda
        //     token: ["punctuation.definition.variable.scheme"],
        //     regex: "lambda"
        // },
        {
            // red constant cadr
            token: "keyword.operator",
            regex: "c[ad]+r"
        }, 
        {
            // purple constant #X0088ff
            token: "constant.numeric", // hex
            regex: "#[xXoObB][0-9a-fA-F]+"
        }, 
        {
            // purple constant -4.5
            token: "constant.numeric", // float
            regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?"
        },
        {
            // purple symbol
            token: "punctuation.definition.constant.character.scheme",
            regex: "'[a-zA-Z\\-]+"
        },
        {
            // purple '()
            token: "punctuation.definition.constant.character.scheme",
            regex: "'\\(\\)"
        },
        {
            // blue, red, purple built-ins
            token: keywordMapper,
            regex: validNameRegex
        },
        {
            // double quote -> go into qqstring state
            token: "string",
            regex: '"(?=.)',
            next: "qqstring"
        }
    ],
    "qqstring": [
        {
            // purple escape character \.
            token: "constant.character.escape.scheme",
            regex: "\\\\."
        },
        {
            token: "string",
            regex: '[^"\\\\]+',
            merge: true
        },
        {
            // purple escape character \$
            token: "string",
            regex: "\\\\$",
            next: "qqstring",
            merge: true
        },
        {
            // strings ends with " or end of line
            token: "string",
            regex: '"|$',
            next: "start",
            merge: true
        }
    ],
    "paramlist": [
        {
            token: "text",
            regex: "\\(",
            next: "param"
        },
        {
            token: "text",
            regex: "\\s+",
            next: "param"
        },
        {
            token: "text",
            regex: "\\)",
            next: "start"
        }
    ],
    "param": [
        {
            // orange parameter
            token: "variable.parameter",
            regex: validNameRegex,
            next: "paramlist",
        }
    ],
    "declaration": [
        {
            // white open parens
            token: "text",
            regex: "\\(",
            next: "funcname"
        },
        {
            // green variable name
            token: "punctuation.definition.variable.scheme",
            regex: validNameRegex,
            next: "start"
        }
    ],
    "funcname": [
        {
            // green function name
            token: "punctuation.definition.variable.scheme",
            regex: validNameRegex,
            next: "paramlist"
        }
    ]
}

};

oop.inherits(SchemeHighlightRules, TextHighlightRules);

exports.SchemeHighlightRules = SchemeHighlightRules;
});

ace.define("ace/mode/matching_parens_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingParensOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\)/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\))/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        var match = line.match(/^(\s+)/);
        if (match) {
            return match[1];
        }

        return "";
    };

}).call(MatchingParensOutdent.prototype);

exports.MatchingParensOutdent = MatchingParensOutdent;
});

ace.define("ace/mode/pscheme",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/pscheme_highlight_rules","ace/mode/matching_parens_outdent"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var SchemeHighlightRules = require("./pscheme_highlight_rules").SchemeHighlightRules;
var MatchingParensOutdent = require("./matching_parens_outdent").MatchingParensOutdent;

var Mode = function() {
    this.HighlightRules = SchemeHighlightRules;
    this.$outdent = new MatchingParensOutdent();
};
oop.inherits(Mode, TextMode);

(function() {
       
    this.lineCommentStart = ";";
    this.minorIndentFunctions = ["define", "lambda", "define-macro", "define-syntax", "syntax-rules", "define-record-type", "define-structure"];

    this.$toIndent = function(str) {
        return str.split('').map(function(ch) {
            if (/\s/.exec(ch)) {
                return ch;
            } else {
                return ' ';
            }
        }).join('');
    };

    this.$calculateIndent = function(line, tab) {
        var baseIndent = this.$getIndent(line);
        var delta = 0;
        var isParen, ch;
        for (var i = line.length - 1; i >= 0; i--) {
            ch = line[i];
            if (ch === '(') {
                delta--;
                isParen = true;
            } else if (ch === '(' || ch === '[' || ch === '{') {
                delta--;
                isParen = false;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                delta++;
            }
            if (delta < 0) {
                break;
            }
        }
        if (delta < 0 && isParen) {
            i += 1;
            var iBefore = i;
            var fn = '';
            while (true) {
                ch = line[i];
                if (ch === ' ' || ch === '\t') {
                    if(this.minorIndentFunctions.indexOf(fn) !== -1) {
                        return this.$toIndent(line.substring(0, iBefore - 1) + tab);
                    } else {
                        return this.$toIndent(line.substring(0, i + 1));
                    }
                } else if (ch === undefined) {
                    return this.$toIndent(line.substring(0, iBefore - 1) + tab);
                }
                fn += line[i];
                i++;
            }
        } else if(delta < 0 && !isParen) {
            return this.$toIndent(line.substring(0, i+1));
        } else if(delta > 0) {
            baseIndent = baseIndent.substring(0, baseIndent.length - tab.length);
            return baseIndent;
        } else {
            return baseIndent;
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        return this.$calculateIndent(line, tab);
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };
    
    this.$id = "ace/mode/pscheme";
}).call(Mode.prototype);

exports.Mode = Mode;
});
