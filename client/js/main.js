$(function() {
	init();
});

var socket = io();

function init() {
	console.info("shout@" + shout.version);	
	
	socket.on(
		"auth",
		function(data) {
			auth();
		}
	);
}

function auth() {
	var login = $("#login");
	
	login.on("click", "button", function() {
		var self = $(this);
		var type = self.data("type");
		
		if (type) {
			socket.emit("auth", type);
		}
	});
	
	login.show();
}
