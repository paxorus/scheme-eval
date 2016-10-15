function run(input) {
	terminal.clear();
	var st = new SourceTree(input);
	if (!st.tree) {
		return;
	}
	var output = st.run();
	output.forEach(function (out) {
		if (out !== undefined) {
			terminal.log(out);
		}
	});
}

function addHeader(text) {
	var header = $("<div>", {class: "suite-header"});
	var headerText = $("<div>", {class: "suite-text"});

	var assertHeader = $("<div>", {class: "assert-header"});
	assertHeader.text("0/0 assertions");
	var assertBar = $("<div>", {class: "assert-bar"});
	var passBar = $("<div>", {class: "pass-bar"});
	var failBar = $("<div>", {class: "fail-bar"});
	assertBar.append(passBar);
	assertBar.append(failBar);

	headerText.text(text);
	headerText.append(assertHeader);
	header.append(headerText);
	header.append(assertBar);

	$("#main").append("<br>");
	$("#main").append(header);
	headerText.click(function () {
		header.children(".pass-report").slideToggle();
		header.children(".fail-report").slideToggle();
		assertBar.slideToggle();
	});

	return {
		passed: 0,
		pass: function (name, result) {
			this.passed ++;
			this.updateBar();
			var report = $("<div>", {class: "pass-report"});
			report.html(name + "<br>output: " + result);
			header.append(report);
		},
		failed: 0,
		fail: function (name, expected, got) {
			this.failed ++;
			this.updateBar();
			var report = $("<div>", {class: "fail-report"});
			report.html(name + "<br>expected: " + expected + "<br>got: " + got);
			header.append(report);
			// make header gray
			header.toggleClass("failed-suite", true);
		},
		updateBar: function () {
			var total = this.passed + this.failed;
			passBar.width(this.passed / total * 100 + "%");
			assertHeader.text(this.passed + "/" + total + " assertions");
		},
		time: function (time) {
			headerText.append(": " + time + "ms");
			if (this.failed == 0) {
				// everything passed, collapse and show bar
				header.children(".pass-report").slideUp();
			} else {
				// show reports, hide bar
				assertBar.slideUp();
			}
		}
	}
}


function Terminal() {
	this.content = "";

	this.log = function (value) {
		this.content = this.stringify(value) + "\n";
	},
	this.clear = function () {
		this.content = "";
	},
	this.error = function (err) {
		this.content = err.name + ": " + err.data + "\n";
	}
	this.stringify = function (x) {
		if (x === true) {
			return "#t";
		} else if (x === false) {
			return "#f";
		} else if (x === null) {
			return "()";
		} else if (typeof x == "string") {
			return x.replace(/\\\\/g, "\\").replace(/\\\"/g, "\"");
		} else if (Array.isArray(x) && x[0] == "procedure") {
			var params = "(" + x[1].join(", ") + ")";
			return params + " -> " + Node.print(x[2]);
		}
		return x;
	}
}
var terminal = new Terminal();