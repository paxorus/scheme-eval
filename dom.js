/* Prakhar Sahay 07/13/2016


*/

$(window).resize(function (evt) {
	$("#editor").css("height",window.innerHeight-175);
	$("#console").css("height",window.innerHeight-175);
	$("#editor").css("width",Math.floor(0.6*window.innerWidth));
	$("#console").css("width",window.innerWidth-$("#editor").width());
});

$(document).ready(function () {
	$(window).resize();
	$("#run").on("click", function (evt) {
		parse($("#editor").val());
		// eval($("#textarea").val(),[]);
	});
});
