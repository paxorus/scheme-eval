/* Prakhar Sahay 07/13/2016


*/

$(window).resize(function (evt) {
	$("#editor").css("height",window.innerHeight-125);
	$("#console").css("height",window.innerHeight-125);
	$("#editor").css("width",Math.floor(0.6*window.innerWidth));
	$("#console").css("width",window.innerWidth-$("#editor").width());
	$("#editor").linedtextarea();
});

$(document).ready(function () {
	$(window).resize();
	$("#run").on("click", function (evt) {
		var value = interpret($("#editor").val());
		$("#console").append(value+"<br>");
	});
});
