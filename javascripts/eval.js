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
	} else if (exp[0] == 'define') {
		evalDefinition(exp, env);
	} else if (exp[0] == 'if') {
		return evalIf(exp, env);
	} else if (exp[0] == 'lambda') {
		return evalLambda(exp, env);
	} else if (exp[0] == 'begin') {
		return evalSequence(exp.slice(1), env);
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
		// console.log(proc[2][0]+"");
		return evalSequence(proc[2], newEnv);
	} else {
		throw {name: "Unknown procedure", data: "Did you ever create the function '" + proc + "'?"};
	}
}

function evalLiteral(exp) {
	// value is independent of env
	if (isNumber(exp)) {
		return +exp;
	}else if (isString(exp)) {
		return exp.slice(1,-1);
	}else{
		return (exp == "#t") ? true : false;
	}
}

function evalDefinition(exp, env) {
	var varName, body;
	if (Parser.isNode(exp[1])) {
		varName = exp[1].children[0];
		body = ["lambda", exp[1].children.slice(1), exp.slice(2)];
	} else {
		varName = exp[1];
		body = exp[2];
	}
	var value = eval(body, env);
	env.set(varName, value);
}

function evalIf(exp, env) {
	var predicate = eval(exp[1], env);
	var branch = exp[predicate ? 2 : 3];
	return eval(branch, env);
}

function evalLambda(exp, env) {
	// ["procedure", parameters, body, env]
	var params = exp[1];
	if (Parser.isNode(params)) {
		params = params.children;
	}
	return ["procedure", params, exp[2], env];
}

function evalSequence(exp, env) {
	// toss all expression results except the final result
	var values = exp.map(function (subExp) {
		return eval(subExp, env);
	});
	return values[values.length - 1];
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
		var frame = this._frameOf(varName);
		return (frame === null) ? undefined : frame[varName];
	};

	this.set = function (varName, val) {
		var frame = this._frameOf(varName) || _lookup;
		frame[varName] = val;
	}

	this._frameOf = function (varName) {
		if (_lookup[varName] !== undefined) {
			// check if in this frame
			return _lookup;
		} else if (_base === null) {
			// exit if no lower frames
			return null;
		} else {
			// recursively search lower
			return _base._frameOf(varName);
		}
	}

	this.extend = function (newFrame) {
		return new Environment(this, newFrame);
	};
}


/**
 * Maps variable name (string) to value (any type).
 * @param {object} varList - Environment{} or null
 * @param {object} valList - variable->value map
 */
function Frame(varList, valList) {
	for (var i = 0; i < varList.length; i ++) {
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




// HELPER PREDICATES

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