/* Prakhar Sahay 07/13/2016

procedure: ["procedure", params[], body, Env], change this to an object later
*/


function eval(exp, env) {
	// exp could be a Node or a string
	exp = Parser.isNode(exp) ? exp.children : exp;
	
	if (isLiteral(exp)) {
		return evalLiteral(exp);
	} else if (isAtom(exp)) {
		return lookupVariableValue(exp, env);
	} else if (isApplication(exp)) {
		var proc = eval(exp[0], env);
		var args = exp.slice(1).map(function (arg) {
			return eval(arg, env);
		});
		return apply(proc, args);
	} else {
		throw {name: "Runtime error", data: "Yikes! What have you done?"};
	}
}

function apply(proc, args) {
	if (isPrimitiveProcedure(proc)) {
		return applyPrimitiveProcedure(proc, args);
	} else if (isCompoundProcedure(proc)) {
		var newFrame = new Frame(proc[1], args);
		var newEnv = proc[3].extend(newFrame);
		return evalSequence(proc[2], newEnv);
	} else {
		throw {name: "Unknown procedure", data: "Did you ever create the function '" + proc + "'?"};
	}
}



function evalSequence(exps, env) {
	var results = exps.map(function(exp) {
		return eval(exp);
	});
	return results[results.length - 1];
}

function evalLiteral(exp) {
	if (isNumber(exp)) {
		return +exp;
	}else if (isString(exp)) {
		return exp.slice(1,-1);
	}else{
		return (exp == "#t") ? true : false;
	}
}


function isLiteral(exp) {
	return isAtom(exp) && (isNumber(exp) || isString(exp) || isBoolean(exp));
}

function isNumber(exp) {
	return !isNaN(+exp);// (NaN === NaN) is false
}

function isString(exp) {
	return exp[0] == "\"" && exp[exp.length-1] == "\"";
}

function isBoolean(exp) {
	return exp == "#t" || exp == "#f";
}

function isApplication(exp) {
	return exp instanceof Array;
}

function isAtom(exp) {
	return !(exp instanceof Array);
}

function isPrimitiveProcedure(proc) {
	return proc[0] == "primitive";
}

function isCompoundProcedure(proc) {
	return proc[0] == "procedure";
}

function applyPrimitiveProcedure(proc, args) {
	var implementation = proc[1];
	// JS-apply expects array, so we package into an array if an atom
	// HOWEVER our list representations use an array so they would not get packaged here
	// and a list would appear as two arguments
	if (!Array.isArray(args)) {
		args = [args];
	}
	return implementation.apply(undefined, args);
}

/**
 * @param {object} baseEnv - Environment{} or null
 * @param {object} newFrame - variable->value map
 */

function Environment(baseEnv, newFrame) {
	var _base = baseEnv;
	var _lookup = newFrame;

	this.get = function (varName) {
		// if not this frame, search lower frames
		if (_lookup[varName]) {
			return _lookup[varName];
		} else if (_base === null) {
			// no lower frames
			return undefined;
		} else{
			// recursively search lower
			return _base.get(varName);
		}
	};

	this.extend = function (newFrame) {
		return new Environment(this,newFrame);
	};
}

function Frame(varList, valList) {
	console.log("wip frame");
	// error if list lengths differ
	for( var i = 0; i < varList.length; i ++) {
		this[varList[i]] = valList[i];
	}
}

function lookupVariableValue(varName, env) {
	var value = env.get(varName);
	if (value === undefined) {
		throw {name: "Unbound variable", data: "Did you ever set the variable '" + varName + "'?"};
	}
	return value;
}

function setupEnvironment() {
	var primitiveFrame = {};
	Object.keys(Primitive).forEach(function (op) {
		primitiveFrame[op] = ["primitive", Primitive[op]];
	});
	return new Environment(null, primitiveFrame);
}
