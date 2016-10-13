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
	} else if (exp[0] == 'set!') {
		return evalSet(exp, env);
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
		return evalSequence(proc[2], newEnv);
	} else {
		throw {name: "Unknown procedure", data: "Did you ever create the function '" + proc + "'?"};
	}
}

function evalLiteral(exp) {
	// value can be evaluated independent of env
	if (isNumber(exp)) {
		return +exp;
	}else if (isString(exp)) {
		return exp.slice(1, -1);
	}else{
		return (exp == "#t") ? true : false;
	}
}

function evalSet(exp, env) {
	if (exp.length != 3) {
		throw {
			name: "set!: bad syntax",
			data: " has " + pl(exp.length - 1, "part") + " after keyword in: " + Node.print(exp)
		};
	}
	var varName = exp[1];
	var value = exp[2];
	env.setIfExists(varName, value);
	return undefined;
}

function evalDefinition(exp, env) {
	if (exp.length == 1) {// (define)
		throw {
			name: "define: bad syntax",
			data: "in: " + Node.print(exp)
		};
	}

	var varName, value;
	if (Parser.isNode(exp[1])) {
		if (exp[1].length == 0) {
			throw {
				name: "define: bad syntax",
				data: "in: ()"
			}
		}
		// if (exp.length == 2) {
		// 	throw {

		// 	};
		// }

		varName = exp[1].children[0];
		var params = exp[1].children.slice(1);
		value = ["procedure", params, exp.slice(2), env];
	} else {
		if (exp.length == 2) {// (define x)
			throw {
				name: "define: bad syntax",
				data: "missing expression after identifier in: " + Node.print(exp)
			};
		} else if (exp.length >= 4) {// (define x 1 2)
			throw {
				name: "define: bad syntax",
				data: "multiple expressions after identifier in: " + Node.print(exp)
			};
		}
		varName = exp[1];
		value = eval(exp[2], env);
	}
	env.set(varName, value);
}

function evalIf(exp, env) {
	var predicate = eval(exp[1], env);
	if (exp.length >= 5) {
		throw {name: "if", data: "bad syntax in: " + Node.print(exp)};
	} else if (predicate) {
		return eval(exp[2], env);
	} else if (exp.length == 3) {
		// no output
		return undefined;
	} else {
		return eval(exp[3], env);
	}
}

function evalLambda(exp, env) {
	// ["procedure", parameters, body, env]
	if (exp.length == 1) {// (lambda)
		throw {
			name: "lambda: bad syntax",
			data: "in: " + Node.print(exp)
		};
	} else if (exp.length == 2) {// (lambda (x))
		throw {
			name: "no expression in body",
			data: "in: " + Node.print(exp)
		};
	}
	var params = exp[1];
	if (Parser.isNode(params)) {
		params = params.children;
	}

	return ["procedure", params, exp.slice(2), env];
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
		_lookup[varName] = val;
	}

	this.setIfExists = function (varName, val) {
		var frame = this._frameOf(varName);
		if (frame === null) {
			throw {
				name: "set!: assignment disallowed",
				data: varName + " hasn't been defined yet"
			}
		}
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
	return exp.length >= 2 && exp[0] == "\"" && exp[exp.length-1] == "\"";
}

function isBoolean(exp) {
	return exp == "#t" || exp == "#f";
}

function isApplication(exp) {
	return Array.isArray(exp);
}

function isAtom(exp) {
	return !Array.isArray(exp);
}

function isPrimitiveProcedure(proc) {
	return proc[0] == "primitive";
}

function isCompoundProcedure(proc) {
	return proc[0] == "procedure";
}