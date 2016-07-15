/* Prakhar Sahay 07/13/2016

procedure: ["procedure", params[], body, Env], change this to an object later
*/


function eval(text, env){
	var exp = parse(text);
	// exp could be an array of strings or one string
	if(isLiteral(exp)){
		return evalLiteral(exp);
	}else if(isAtom(exp)){
		return lookupVariableValue(exp, env);
	}else if(isApplication(exp)){
		var proc = eval(exp[0], env);
		var args = exp.slice(1).map(function(arg){
			return eval(arg, env);
		});
		return apply(proc, args);
	}else{
		error("Unknown expression type -- EVAL", exp);
	}
}

function apply(proc, args){
	if(isPrimitiveProcedure(proc)){
		return applyPrimitiveProcedure(proc, args);
	}else if(isCompoundProcedure(proc)){
		var newFrame = new Frame(proc[1], args);
		var newEnv = proc[3].extend(newFrame);
		return evalSequence(proc[2], newEnv);
	}else{
		error("Unknown procedure type -- APPLY", proc);
	}
}



function evalSequence(exps, env){
	var results = exps.map(function(exp){
		return eval(exp);
	});
	return results[results.length-1];
}

function evalLiteral(exp){
	if(isNumber(exp)){
		return +exp;
	}else if(isString(exp)){
		return exp.slice(1,-1);
	}else{
		return (exp == "#t") ? true : false;
	}
}


function isLiteral(exp){
	return isAtom(exp) && (isNumber(exp) || isString(exp) || isBoolean(exp));
}

function isNumber(exp){
	return !isNaN(+exp);// (NaN === NaN) is false
}

function isString(exp){
	return exp[0] == "\"" && exp[exp.length-1] == "\"";
}

function isBoolean(exp){
	return exp == "#t" || exp == "#f";
}

function isApplication(exp){
	return exp instanceof Array;
}

function isAtom(exp){
	return !(exp instanceof Array);
}

var primitiveProcedures = {
	car: function(c){return c[0]},
	cdr: function(c){return c[1]},
	cons: function(x,y){assertNargs(arguments,2);return [x,y]},
	list: function(){
		if(arguments.length == 0){
			return null;
		}
		var index = arguments.length - 1;
		var cell = arguments[index];
		for(;index>=0;index--){
			cell = primitiveProcedures.cons(arguments[index], cell);
		}
		return cell;
	},
	map: function(proc, list){
		assertNargs(arguments,2);
		// assert procedure and list
		if(list === null){
			return null;
		}else{
			return primitiveProcedures.cons(
				proc(primitiveProcedures.car(list)),
				primitiveProcedures.map(proc, primitiveProcedures.cdr(list))
			);
		}
	},
	append: function(){
		if(arguments.length == 0){
			return null;
		}
		console.log("wip");
	},
	"null?": function(x){assertNargs(arguments,1);return x === null},
	"zero?": function(x){assertNargs(arguments,1);assertNum(arguments);return x === 0},
	"eq?": function(a,b){return a === b},// todo
	"equal?": function(a,b){return a === b},// todo
	"1+": function(a){assertNargs(arguments,1);assertNum(arguments);return a+1},
	"-1+": function(a){assertNargs(arguments,1);assertNum(arguments);return a-1},
	quotient: function(a,b){assertNargs(arguments,2);assertNum(arguments);return Math.floor(a/b)},
	remainder: function(a,b){assertNargs(arguments,2);assertNum(arguments);return a%b},
	"/": function(){
		var args = fix(arguments);
		assertNargs(args,">=1");
		assertNum(args);
		var dividend=args.unshift();
		return args.reduce(function(a,b){return a/b},dividend);
	},
	"*": function(){
		var args = fix(arguments);
		assertNum(args);
		return args.reduce(function(a,b){return a*b},1);
	},
	"+": function(){
		var args = fix(arguments);
		assertNum(args);
		return args.reduce(function(a,b){return a+b},0);
	},
	"-": function(){
		var args = fix(arguments);
		assertNargs(args,">=1");
		assertNum(args);
		var minuend=args.unshift();
		return args.reduce(function(a,b){return a-b},minuend);
	},
	"=": function(){
		assertNargs(arguments,">=2");
		assertNum(arguments);
		for(var i=1;i<arguments.length;i++){
			if(arguments[i-1] !== arguments[i]){
				return false;
			}
		}
		return true;
	}
}

function isPrimitiveProcedure(proc){
	return proc[0] == "primitive";
}

function isCompoundProcedure(proc){
	return proc[0] == "procedure";
}

function applyPrimitiveProcedure(proc, args){
	var implementation = proc[1];
	return implementation.apply(undefined, args);
}

/**
 * @param {object} baseEnv - Environment{} or null
 * @param {object} newFrame - variable->value map
 */

function Environment(baseEnv, newFrame){
	var _base = baseEnv;
	var _lookup = newFrame;

	this.get = function (varName) {
		// if not this frame, search lower frames
		if(_lookup[varName]){
			return _lookup[varName];
		}else if(_base === null){
			// no lower frames
			return undefined;
		}else{
			// recursively search lower
			return _base.get(varName);
		}
	};

	this.extend = function (newFrame) {
		return new Environment(this,newFrame);
	};
}

function Frame(varList, valList){
	console.log("wip");
	// error if list lengths differ
	for(var i=0;i<varList.length;i++){
		this[varList[i]] = valList[i];
	}
}

function lookupVariableValue(varName, env){
	var value = env.get(varName);
	if(value === undefined){
		error("Unbound variable", varName);
	}
	return value;
}

function setupEnvironment(){
	var primitiveFrame = {};
	Object.keys(primitiveProcedures).forEach(function (op) {
		primitiveFrame[op] = ["primitive", primitiveProcedures[op]];
	});
	return new Environment(null, primitiveFrame);
}


// WARNINGS AND ERRORS

function assertNargs(){
	console.log("wip");
}

function assertNum(){
	console.log("wip");
}

function error(message, obj){
	// involve pretty-printing
	console.log(message + "\n" + obj);
}

// SYNTAX PARSING

function interpret(text){
	text = text.split("\n").map(stripComment).join("\n");
	text = text.trim();// an initial trim is necessary
	var initialEnv = setupEnvironment();
	return eval(text, initialEnv);
}

function parse(exp){
	// todo: () matching
	if(!exp.startsWith("(")){
		return exp;
	}

	// " (a (b c) d) " --> [a,"(b c)",d]
	var parts = [];

	var buffer = "";
	var depth = 1;
	for(var i=1; i<exp.length; i++){
		if(isWhiteSpace(exp[i]) && depth == 1){
			if(buffer.length > 0){
				parts.push(buffer);
				buffer = "";
			}
		}else{
			buffer += exp[i];
			if(exp[i] == "("){
				depth++;
			}else if(exp[i] == ")"){
				depth--;
				if(depth==0 && buffer.length > 1){
					// edge case for final token "...)"
					parts.push(buffer.slice(0,-1));
				}
			}
		}
	}
	return parts;
}

function stripComment(line){
	// find first semicolon that is not part of a string
	if(line.indexOf(";") == -1){
		return line;
	}

	var insideString = false;
	for(var i=0; i<line.length; i++){
		if(line[i] == "\""){
			insideString = !insideString;
		}else if(line[i] == ";" && !insideString){
			return line.substring(0, i);
		}
	}
	return line;
}

function isWhiteSpace(char){
	return ["\n","\t"," "].indexOf(char) > -1;
}

function fix(arguments){
	return Array.prototype.slice.call(arguments);
}