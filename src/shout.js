var http = require("http");
var express = require("express");
var io = require("socket.io");
var config = require("./config");

module.exports = shout;

var sockets;

function shout() {
  var app = express()
		.use(serve)
    .use(express.static("client"));

	var srv = http.createServer(app);
	srv.listen(config("port"));

	sockets = io(srv)
	sockets.on("connect", function(s) {
		init(s);
	});
};

function serve(req, res, next) {
	return next();
}

function init(socket) {
	console.log("Client connect.");
}
