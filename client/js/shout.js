$(function() {
	load();
});

var socket = io();
var events = new EventEmitter;

function load() {
	socket.on("init", init);
	socket.on("network", function(data) {
		console.log(data);
	});

	gui();
}

function init() {
	connect();
}
