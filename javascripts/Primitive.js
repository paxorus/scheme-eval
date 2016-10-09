function Node(x, y) {
	this.x = x;
	this.y = y;
	this.toString = function (notTop) {
		return "(" + this._s() + ")";
	};
	this._s = function () {
		if (this.y === null) {
			return this.x;
		} else if (this.y.constructor.name != "Node") {
			return this.x + " . " + this.y;
		} else {
			return this.x + " " + this.y._s();
		}
	};
}

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
	car: function (c) {
		return c.x;
	},
	cdr: function (c) {
		return c.y;
	},
	cons: function (x, y) {
		assert(arguments, 2);
		return new Node(x, y);
	},
	list: function () {
		var args = assert(arguments);
		if (args.length == 0) {
			return null;
		}
		var index = args.length - 1;
		var cell = null;
		for (; index >= 0; index --) {
			cell = Primitive.cons(args[index], cell);
		}
		return cell;
	},
	length: function (list) {
		var args = assert(arguments, 1);
		var _length = function (l) {
			if (l === null) {
				return 0;
			}
			return _length(Primitive.cdr(l)) + 1;
		};
		return _length(list);
	},
	// reverse: function (list) {
	// 	var args = assert(arguments, 1);
	// 	var _reverse = function (for, rev) {
	// 		if (for === null) {
	// 			return null;
	// 		}
	// 		return Primitive.cons(
	// 			_reverse(Primitive.cdr(l)),
	// 			Primitive.car(l)
	// 		);
	// 	};
	// 	return _reverse(list, null);
	// },
	map: function (proc, list) {
		assert(arguments, 2);

		var _map = function (l) {
			if (l === null) {
				return null;
			}
			return Primitive.cons(
				apply(proc, Primitive.car(l)),
				_map(Primitive.cdr(l))
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
			return Primitive.cons(
				Primitive.car(subl1),
				_append(Primitive.cdr(subl1))
			);
		}
		return _append(l1);
	},
	"null?": function (x) {
		assert(arguments, 1);
		return x === null;
	},
	"zero?": function (x) {
		nassert(arguments, 1);
		return x === 0;
	},
	"eq?": function (a, b) {
		return a === b;
	},// todo
	"equal?": function (a, b) {
		return a === b;
	},// todo
	"1+": function (a) {
		nassert(arguments, 1);
		return a + 1;
	},
	"-1+": function (a) {
		nassert(arguments, 1);
		return a - 1;
	},
	quotient: function (a,b) {
		nassert(arguments, 2);
		return Math.floor(a / b);
	},
	remainder: function (a,b) {
		nassert(arguments, 2);
		return a % b;
	},
	"=": function () {
		var args = nassert(arguments, ">=2");
		for(var i = 1; i < arguments.length; i ++) {
			if(arguments[i-1] !== arguments[i]) {
				return false;
			}
		}
		return true;
	}
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
		console.log(reqNum);
		console.log(funcArgs.length);
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