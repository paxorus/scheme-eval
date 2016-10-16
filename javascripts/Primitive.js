function Cell(x, y) {
	this.x = x;
	this.y = y;
	this.toString = function (notTop) {
		return "(" + this._s() + ")";
	};
	this._s = function () {
		if (this.y === null) {
			return this.x;
		} else if (this.y.constructor.name != "Cell") {
			return this.x + " . " + this.y;
		} else {
			return this.x + " " + this.y._s();
		}
	};
}

var car = function (c) {
	assert(arguments, 1);
	return c.x;
};
var cdr = function (c) {
	assert(arguments, 1);
	return c.y;
};
var cons = function (x, y) {
	assert(arguments, 2);
	return new Cell(x, y);
};

var Primitive = {
	"+": function () {
		var args = nassert(arguments);
		return args.reduce(function (a, b) {
			return a + b;
		}, 0);
	},
	"-": function () {
		var args = nassert(arguments, ">=1");
		var minuend = args.shift();
		return args.reduce(function (a, b) {
			return a - b;
		}, minuend);
	},
	"*": function () {
		var args = nassert(arguments);
		return args.reduce(function (a, b) {
			return a * b;
		}, 1);
	},
	"/": function () {
		var args = nassert(arguments, ">=1");
		var dividend = args.shift();
		return args.reduce(function (a,b) {
			return a / b;
		}, dividend);
	},
	"<": function () {
		var args = nassert(arguments, 2);
		return args[0] < args[1];
	},
	"<=": function () {
		var args = nassert(arguments, 2);
		return args[0] <= args[1];
	},
	">": function () {
		var args = nassert(arguments, 2);
		return args[0] > args[1];
	},
	">=": function () {
		var args = nassert(arguments, 2);
		return args[0] >= args[1];
	},
	"=": function () {
		var args = nassert(arguments, 2);
		return args[0] == args[1];
	},
	"eq?": function (a, b) {
		assert(arguments, 2);
		return a === b;
	},
	"eqv?": function (a, b) {
		return Primitive["eq?"](a, b);
	},
	"equal?": function (a, b) {
		assert(arguments, 2);
		var _deepEqual = function (a, b) {
			var aIsPair = Primitive["pair?"](a);
			var bIsPair = Primitive["pair?"](b);
			if (aIsPair && bIsPair) {
				return _deepEqual(car(a), car(b)) && _deepEqual(cdr(a), cdr(b));
			} else if (!aIsPair && !bIsPair) {
				return a === b;
			} else {
				return false;
			}
		}
		return _deepEqual(a, b);
	},
	display: function () {
		var args = assert(arguments, 1);
		terminal.log(args[0]);
	},
	newline: function () {
		var args = assert(arguments, 0);
		terminal.log("");
	},
	error: function (name, data) {
		var args = assert(arguments, 2);
		terminal.error({name: name, data: data});
	},
	car: car,
	cdr: cdr,
	cons: cons,
	"null?": function (x) {
		assert(arguments, 1);
		return x === null;
	},
	"pair?": function (x) {
		assert(arguments, 1);
		return x && x.constructor.name == "Cell";
	}
};

var AdvancedLib = {
	list: function () {
		var args = assert(arguments);
		if (args.length == 0) {
			return null;
		}
		var index = args.length - 1;
		var cell = null;
		for (; index >= 0; index --) {
			cell = cons(args[index], cell);
		}
		return cell;
	},
	length: function (list) {
		var args = assert(arguments, 1);
		var _length = function (l) {
			if (l === null) {
				return 0;
			}
			return _length(cdr(l)) + 1;
		};
		return _length(list);
	},
	reverse: function (list) {
		var args = assert(arguments, 1);
		var _reverse = function (forw, rev) {
			if (forw === null) {
				return rev;
			}
			return _reverse(
				cdr(forw),
				cons(car(forw), rev)
			);
		};
		return _reverse(list, null);
	},
	map: function (proc, list) {
		assert(arguments, 2);

		var _map = function (l) {
			if (l === null) {
				return null;
			}
			return cons(
				apply(proc, car(l)),
				_map(cdr(l))
			);
		};
		return _map(list);
	},
	append: function (l1, l2) {
		assert(arguments, 2);

		// traverse l1 to final element
		var _append = function (subl1) {
			if (subl1 === null) {
				return l2;
			}
			return cons(
				car(subl1),
				_append(cdr(subl1))
			);
		}
		return _append(l1);
	},
	not: function (a) {
		assert(arguments, 1);
		// returns true for 0 and "", unlike R5RS
		return !a;
	}
};

var MathLib = {
	"1+": function (a) {
		nassert(arguments, 1);
		return a + 1;
	},
	"-1+": function (a) {
		nassert(arguments, 1);
		return a - 1;
	},
	quotient: function (a, b) {
		nassert(arguments, 2);
		return Math.floor(a / b);
	},
	remainder: function (a, b) {
		nassert(arguments, 2);
		return a % b;
	},
	modulo: function (a, b) {
		nassert(arguments, 2);
		var mod = a % b;
		return (mod < 0) ? mod + b : mod;
	},
	max: function () {
		var args = nassert(arguments, ">=1");
		return args.reduce(function (cumul, a) {
			return Math.max(cumul, a);
		});
	},
	min: function () {
		var args = nassert(arguments, ">=1");
		return args.reduce(function (cumul, a) {
			return Math.min(cumul, a);
		});
	},
	abs: function (x) {
		nassert(arguments, 1);
		return Math.abs(x);
	},
	"zero?": function (x) {
		nassert(arguments, 1);
		return x === 0;
	},
}

for (op in AdvancedLib) {
	Primitive[op] = AdvancedLib[op];
}

for (op in MathLib) {
	Primitive[op] = MathLib[op];
}

// ASSERTIONS

function nassert(funcArgs, nArgReq) {
	funcArgs = assert(funcArgs, nArgReq);
	// all parameters must be numerical
	assertNum(funcArgs);
	return funcArgs;
}

function assert(funcArgs, nArgReq) {

	funcArgs = Array.prototype.slice.call(funcArgs);
	// if some requirement on the number of arguments
	if (nArgReq) {
		assertNargs(funcArgs, nArgReq);
	}

	return funcArgs;
}


function assertNargs(funcArgs, req){
	var valid;
	if (typeof req == "number") {
		valid = funcArgs.length == req;
	} else if (req.startsWith(">=")) {
		reqNum = parseInt(req.substring(2), 10);
		valid = funcArgs.length >= reqNum; 
	}
	if (!valid) {
		throw {
			name: "Invalid number of arguments",
			data: "Expected " + pl(req, "argument") + ", saw " + funcArgs.length + " instead"
		};
	}
}

function assertNum(funcArgs){
	var nanIdx;
	var someNonNumber = funcArgs.some(function (x, idx) {
		nanIdx = idx; 
		return typeof x != "number";
	});
	if (someNonNumber) {
		throw {
			name: "Invalid type",
			data: "Expected number for positional argument " + (nanIdx + 1) + ", saw " +
				pp(funcArgs[nanIdx]) + " instead."
		};
	}
}

function pp(x) {
	// if string, add double quotes for printing
	if (typeof x == "string") {
		return "\"" + x + "\"";
	}
	return x;
}

function pl(num, str) {
	// pluralize string
	return num + " " + str + ((num == 1) ? "" : "s");
}