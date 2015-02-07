$(function() {
	var socket = io();

	$(".lt").on("touchstart click", function(e) {
		e.preventDefault();
		e.stopPropagation();
		$("body").toggleClass("lt");
	});

	alert(JST["chan"]());
});
