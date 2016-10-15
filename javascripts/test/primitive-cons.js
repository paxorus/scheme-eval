TestSuite.new("cons", function (assert) {
	
	run("(cons 3 4)");
	assert.log("basic cons", "(3 . 4)\n");

	run("(cons (cons 1 2) (cons 3 4))");
	assert.log("nested cons", "((1 . 2) 3 . 4)\n");

	run("(cons (cons 1 2) (cons 3 4))");
	assert.log("nested cons", "((1 . 2) 3 . 4)\n");

	run("(cons 5)");
	assert.log("cons must have two parameters", "...");

	run("(cons 1 2 3)");
	assert.log("cons must have two parameters", "...");
});

TestSuite.new("car", function (assert) {

	run("(car (cons 3 4))");
	assert.log("basic car", "3\n");

	run("(car 3)");
	assert.log("car can only take pair", "...");

	run("(car 3 4)");
	assert.log("car must have one parameter", "...");
});

TestSuite.new("cdr", function (assert) {

	run("(cdr (cons 3 4))");
	assert.log("basic cdr", "4\n");

	run("(cdr 3)");
	assert.log("cdr can only take pair", "...");

	run("(cdr 3 4)");
	assert.log("cdr must have one parameter", "...");
});