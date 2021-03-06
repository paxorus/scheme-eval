/**
 * Prakhar Sahay 10/11/2016
 *
 * Parser takes the source code as a string and builds an abstract syntax tree. 
 */

var Parser = {
	parse: function (source) {

		source = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		this.str = source;

		this.lineIdx = 0;
		this.charIdx = 0;
		this.buffer = "";
		var tree = new Node(null);
		this._parse(tree);

		if (this.charIdx < this.str.length) {
			throw {name: "Parenthesis mismatch", data: "I think you've got an extra ')'."};
		} else if (this.charIdx > this.str.length) {
			throw {name: "Parenthesis mismatch", data: "I think you're missing a ')'."};
		}
		return tree;
	},

	_parse: function (node) {
		for (; this.charIdx < this.str.length; this.charIdx ++) {
			var char = this.str[this.charIdx];
			var shouldFlush = true;
			switch (char) {
				case "(":
					// if "(" begin new recursive call
					var child = new Node(node);
					this.charIdx ++;
					this._parse(child);
					break;
				case "\n":
					this.lineIdx ++;
					break;
			 	case ")":
					// ")" --> end recursive call
					this.flush(node);
					return;
				case ";":
					this.charIdx = this.findNext("\n");
					if (this.charIdx == -1) {
						this.charIdx = this.str.length - 1;
					}
					break;
				case "\"":
					// var idx = this.charIdx + 1;
					// this.charIdx ++;
					this.readString(node);
					break;
				case "\t":
				case " ":
					break; // whitespace, do nothing
				case "'":
					this.flush(node);
					if (this.str[this.charIdx + 1] == "(") {
						var idx = this.findNext(")");
						var symbolList = this.str.substring(this.charIdx, idx + 1);
						node.add(symbolList);
						this.charIdx = idx + 1;
					} else {
						shouldFlush = false;// start a new buffer
					}
					break;
				default:
					// number, digit, other character
					shouldFlush = false;
			}
			if (shouldFlush) {
				// we hit an identifier stopper: (, ), whitespace
				this.flush(node);
			} else {
				this.buffer += char;
			}
		}
		// edge case where last line is an atom, no newline at eof
		this.flush(node);
	},

	findNext: function (char) {
		for (var i = this.charIdx; i < this.str.length; i ++) {
			if (this.str[i] == char) {
				return i;
			}
		}
		return -1;
	},

	flush: function (node) {
		if (this.buffer.length == 0) {
			return;
		}
		node.add(this.buffer);
		this.buffer = "";
		this.symbolMode = false;
	},

	readString: function (node) {
		var previousIdx = this.charIdx;
		do {
			this.charIdx ++;// step past current double quote
			idx = this.findNext("\"");
			this.charIdx = idx;
			if (idx == -1) {
				throw {
					name: "Double quote mismatch",
					data: "The string on line " + this.lineIdx + " never ends!"
				};
			}
		} while (this.str[idx - 1] == "\\");
		// slice to include double quotes
		var string = this.str.substring(previousIdx, idx + 1);
		node.add(string);
		this.lineIdx += string.split("\n").length - 1;
	},

	validate: function (node) {
		// navigate tree, validate all variable and symbol names
		if (!node.children) {
			// is a string
			var type = "variable";
			if (node[0] == "'") {
				node = node.substring(1);
				type = "symbol";
			} else if (node[0] == "\"" || node == "#t" || node == "#f") {
				return; // string -> any characters are valid
			}
			var that = this;
			node.split("").forEach(function (char) {
				if (!that._isAlphanumeric(char) && !that._VALID_SYMBOLS.has(char)) {
					throw {
						name: "Bad identifier: " + node,
						data: "Sorry, the [" + char + "] character isn't allowed in " + type + " names"
					};
				}
			});
			return;
		}
		node.children.forEach(function (child) {
			Parser.validate(child);
		});
	},

	// naming rules: alphanumeric, .?:~, and !@$%^&*-_+=/\<> (not #`,"';{}[])
	_VALID_SYMBOLS: new Set(".?:~!@$%^&*-_+=/\\<>"),

	_isAlphanumeric: function (c) {
		c = c.toLowerCase();
		return (c >= "a" && c <= "z") || (c >= "0" && c <= "9");
	},

	isNode: function (obj) {
		return obj && obj.constructor && obj.constructor.name == "Node";
	}
}

function Node(parent) {
	this.parent = parent;
	if (this.parent != null) {
		this.parent.add(this);
	}
	this.children = [];
	this.add = function (child) {
		this.children.push(child);
	}
	this.toString = function () {
		var s = "";
		if (this.children.length > 0) {
			var childStrings = this.children.map(function (x) {
				return x.toString();
			});
			s = childStrings.join(" ");
		}
		if (this.parent == null) {
			return s;
		}
		return "(" + s + ")";
	}
}

Node.print = function (exp) {
	return "(" + exp.join(", ") + ")";
}