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
	var left = Math.floor(0.5 * window.innerWidth);
	var right = window.innerWidth - left;
	var height = window.innerHeight - 125;

	$("#editor").height(height);
	$("#editor").width(left);

	$("#terminal").height(height);
	$("#terminal").width(window.innerWidth - left);
	$("#terminal").css("left", left);

	// $("#run").css("top", height);
});

$(document).ready(function () {
	$(window).resize();
	// $("#run").on("click", run);
});

function run() {
	terminal.clear();
	var input = editor.getValue();
	// var output = interpret(input);
	// console.log(output);
	// terminal.log(output);
	var st = new SourceTree(input);
	console.log(st.tree);
	console.log(st.tree.toString());
	window.x = st.tree;
	// window.y = 
}

function Terminal(node) {
	this.log = function (line) {
		var textNode = $("<span>", {class: "terminal-entry"});
		// var line = this.stringify(value);
		textNode.text(line);
		node.append(textNode);
		node.append("<br>");
	},
	this.clear = function () {
		node.html("");
	},
	this.error = function (err) {
		var textNode = $("<span>", {class: "terminal-error"});
		textNode.text(err.name + ": " + err.data);
		node.append(textNode);
		node.append("<br>");
	}
}
var terminal = new Terminal($("#terminal"));