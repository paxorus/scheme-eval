/**
 * Prakhar Sahay 07/13/2016
 */

// Ace editor init
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/pscheme");
editor.$blockScrolling = Infinity;// disabling warning

editor.commands.addCommand({
	name: 'run',
	bindKey: {win: 'Ctrl-Y', mac: 'Command-Y'},
	exec: run
});

$(window).resize(function (evt) {
	var left = Math.floor(0.6 * window.innerWidth);
	var right = window.innerWidth - left;
	var height = window.innerHeight - 125;

	$("#editor").height(height);
	$("#editor").width(left);

	var horizPadding = 10;
	$("#terminal").height(height);
	$("#terminal").width(window.innerWidth - left - 2 * horizPadding);
	$("#terminal").css("left", left);
	$("#terminal").css("padding", "0 " + horizPadding + "px");

	// $("#run").css("top", height);
});

$(document).ready(function () {
	$(window).resize();
	// $("#run").on("click", run);
});

function run() {
	terminal.clear();
	var input = editor.getValue();
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

function Terminal(node) {
	this.log = function (value) {
		var textNode = $("<span>", {class: "terminal-entry"});
		line = this.stringify(value);
		textNode.text(line);
		node.append(textNode);
		node.append("<br>");
	}
	this.clear = function () {
		node.html("");
	}
	this.error = function (err) {
		var textNode = $("<span>", {class: "terminal-error"});
		textNode.text(err.name + ": " + err.data);
		node.append(textNode);
		node.append("<br>");
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
			// window.y = x;
			return params + " -> " + Node.print(x[2]);
		}
		return x;
	}
}
var terminal = new Terminal($("#terminal"));