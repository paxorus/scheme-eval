TestSuite.new("addition", function (assert) {
	
	run("+");
	assert.log("print +", "...");

	run("(+ 3 4)");
	assert.log("simple", "7\n");

	run("(+ 4.5 -3 16)");
	assert.log("add many", "17.5\n");

	run("(+)");
	assert.log("base case", "0\n");

	run("(+ \"abc\" 5)");
	assert.log("base case", "Invalid type: Expected number for positional argument 1, saw \"abc\" instead.\n");

});

TestSuite.new("subtraction", function (assert) {
	
	run("-");
	assert.log("print -", "...");

	run("(- 3 4)");
	assert.log("simple", "-1\n");

	run("(- 4.5 -3 16)");
	assert.log("subtract many", "-8.5\n");

	run("(-)");
	assert.log("invalid num args", "Invalid number of arguments: Expected >=1 arguments, saw 0 instead\n");

	run("(- 5)");
	assert.log("base case", "5\n");

	run("(- \"abc\" 5)");
	assert.log("base case", "Invalid type: Expected number for positional argument 1, saw \"abc\" instead.\n");

});

TestSuite.new("multiplication", function (assert) {
	
	run("*");
	assert.log("print *", "...");

	run("(* 3 4)");
	assert.log("simple", "12\n");

	run("(* 4.5 -3 16)");
	assert.log("add many", "-216\n");

	run("(*)");
	assert.log("base case", "1\n");

	run("(* \"abc\" 5)");
	assert.log("base case", "Invalid type: Expected number for positional argument 1, saw \"abc\" instead.\n");

});

TestSuite.new("division", function (assert) {
	
	run("/");
	assert.log("print /", "...");

	run("(/ 3 4)");
	assert.log("simple", "0.75\n");

	run("(/ 4.5 -3 16)");
	assert.log("subtract many", "-0.09375\n");

	run("(/)");
	assert.log("invalid num args", "Invalid number of arguments: Expected >=1 arguments, saw 0 instead\n");

	run("(/ 5)");
	assert.log("base case", "5\n");

	run("(/ \"abc\" 5)");
	assert.log("base case", "Invalid type: Expected number for positional argument 1, saw \"abc\" instead.\n");

});