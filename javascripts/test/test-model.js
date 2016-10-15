function runTestSuite(name, routine) {

	var reporter = addHeader(name);

	var assert = {
		log: function (name, x) {
			var result = x === terminal.content;
			if (result) {
				reporter.pass(name, x);
			} else {
				reporter.fail(name, x, terminal.content);
			}
			return result;
		}
	};

	var startTime = new Date();
	routine(assert);
	var endTime = new Date();
	reporter.time(endTime - startTime);
}

var TestSuite = {
	new: runTestSuite
};