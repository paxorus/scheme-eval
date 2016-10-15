TestSuite.new("list", function (assert) {

	run("(list)");
	assert.log("blank list", "()\n");

	run("(cons 1 (cons 2 (list)))");
	assert.log("recognize nested cons as a list", "(1 2)\n");

	run("(cdr (list 4))");
	assert.log("last element is empty", "()\n");
});

TestSuite.new("length", function (assert) {

	run("(length (list))");
	assert.log("base case", "0\n");

	run("(length (cons 1 2) (list 3 4))");
	assert.log("length can only take lists", "...");
});

TestSuite.new("reverse", function (assert) {

	run("(reverse (list))");
	assert.log("base case", "()\n");

	run("(reverse (list 1 2 3 4))");
	assert.log("simple", "(4 3 2 1)\n");

	run("(reverse (list 1 (list 2 3) 4 5))");
	assert.log("complex", "(5 4 (2 3) 1)\n");

	run("(reverse (cons 1 2))");
	assert.log("reverse can only take a list", "...");
});

TestSuite.new("map", function (assert) {

	run("(map 1+ (list))");
	assert.log("base case", "()\n");

	run("(append (list 1 2) (list 3 4))");
	assert.log("basic append", "(1 2 3 4)\n");

	run("(map 1+ (list 1 2 3 4))");
	assert.log("simple", "(2 3 4 5)\n");

	run("(map 5 (list 3 4))");
	assert.log("map first arg must be function", "...");

	run("(map 1+ (cons 1 2))");
	assert.log("map second arg must be list", "...");
});

TestSuite.new("append", function (assert) {

	run("(append (list 1 2) (list 3 4))");
	assert.log("basic append", "(1 2 3 4)\n");

	run("(append (cons 1 2) (list 3 4))");
	assert.log("append can only take lists", "...");
});

