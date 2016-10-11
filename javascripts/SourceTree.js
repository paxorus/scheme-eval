/**
 * Prakhar Sahay 10/09/2016
 *
 * SourceTree takes the source code as a string and builds an abstract syntax tree. 
 */

function SourceTree(source) {

	this.construct = function () {
		// text = text.split("\n").map(stripComment).join("\n");
		// text = text.trim();// an initial trim is necessary
		this.source = source;
		this.tree = new Node(null);
		// this.env = setupEnvironment();// stack
		var parser = new Parser(this.source);
		parser.parse(this.tree);
	};

	this.run = function (text) {
		try {
			return eval(text, initialEnv);
		} catch (e) {
			terminal.error(e);
		}
	};

	this.construct();
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


function Parser(str) {
	this.str = str;
	this.lineIdx = 0;
	this.charIdx = 0;
	this.buffer = "";

	this.parse = function (node) {
		for (; this.charIdx < this.str.length; this.charIdx ++) {
			var char = this.str[this.charIdx];
			var shouldFlush = true;
			if (char == "(") {
				// if "(" begin new recursive call
				var child = new Node(node);
				this.charIdx ++;
				this.parse(child);
			} else if (char == "\n") {
				this.lineIdx ++;
			} else if (char == ")") {
				// ")" --> end recursive call
				this.flush(node);
				break;
			} else if (char == ";") {
				this.charIdx = this.findNext("\n");
			} else if (char == "\"") {
				this.charIdx ++;
				var idx = this.findNext("\"");
				// slice to include double quotes
				var string = "\"" + this.str.substring(this.charIdx, idx + 1);
				node.add(string);
				this.charIdx = idx;
				this.lineIdx += string.split("\n").length - 1;
			} else if (char == "\t" || char == " ") {
				// whitespace, do nothing
			} else if (char == "'") {
				if (this.str[this.charIdx + 1] == "(") {
					var idx = this.findNext(")");
					var symbolList = this.str.substring(this.charIdx, idx + 1);
					node.add(symbolList);
					this.charIdx = idx + 1;
				} else {
					shouldFlush = false;
				}
			} else {
				// number, digit, other character
				shouldFlush = false;
				// throw {name: "Invalid character", data: "Not sure what to make of " + char};
			}
			if (shouldFlush) {
				// we hit an identifier stopper: (, ), whitespace
				this.flush(node);
			} else {
				this.buffer += char;
			}
		}
	}
	this.findNext = function (char) {
		for (var i = this.charIdx; i < this.str.length; i ++) {
			if (this.str[i] == char) {
				return i;
			}
		}
		return -1;
	}
	this.flush = function (node) {
		if (this.buffer.length == 0) {
			return;
		}
		// console.log(this.buffer);
		node.add(this.buffer);
		this.buffer = "";
		this.symbolMode = false;
	}
}



// function parse(exp){
// 	if (exp === undefined) {
// 		throw {name: "Parse error", data: "Yikes! What have you done?"};
// 	}

// 	// todo: () matching
// 	if(!exp.startsWith("(")){
// 		return exp;
// 	}

// 	// " (a (b c) d) " --> [a,"(b c)",d]
// 	var parts = [];

// 	var buffer = "";
// 	var depth = 1;
// 	for(var i=1; i<exp.length; i++){
// 		if(isWhiteSpace(exp[i]) && depth == 1){
// 			if(buffer.length > 0){
// 				parts.push(buffer);
// 				buffer = "";
// 			}
// 		}else{
// 			buffer += exp[i];
// 			if(exp[i] == "("){
// 				depth++;
// 			}else if(exp[i] == ")"){
// 				depth--;
// 				if(depth==0 && buffer.length > 1){
// 					// edge case for final token "...)"
// 					parts.push(buffer.slice(0,-1));
// 				}
// 			}
// 		}
// 	}
// 	return parts;
// }

// function stripComment(line){
// 	// find first semicolon that is not part of a string
// 	if(line.indexOf(";") == -1){
// 		return line;
// 	}

// 	var insideString = false;
// 	for(var i=0; i<line.length; i++){
// 		if(line[i] == "\""){
// 			insideString = !insideString;
// 		}else if(line[i] == ";" && !insideString){
// 			return line.substring(0, i);
// 		}
// 	}
// 	return line;
// }

// function isWhiteSpace(char) {
// 	return ["\n","\t"," "].indexOf(char) > -1;
// }

function isDigit(c) {
	return c >= "0" && c <= "9";
}

function isLetter(c) {
	c = c.toLowerCase();
	return c >= "a" && c <= "z";
}