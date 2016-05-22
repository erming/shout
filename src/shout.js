var _ = require("lodash");
var http = require("http");
var express = require("express");
var fs = require("fs");
var io = require("socket.io");
var version = require("../package.json").version;
var config = require("./config");

module.exports = shout;

function shout() {
	var root = config("root");
	var app = express()
		.use(root, serve)
		.use(root, express.static("client"));
	
	var server = http.createServer(app).listen(config("port"));
	
	var sockets = io(server);
	sockets.on("connect", function(s) {
		// ..
	});
	
	console.log("");
	console.log("shout@" + version)
	console.log("");
	console.log("host  " + config("host"));
	console.log("port  " + config("port"));
	console.log("root  " + config("root"));
	console.log("mode  " + _.keys(_.pick(config("mode"), function(mode) { return mode; })).join(", "));
	console.log("");
	console.log("Server started!");
	console.log("Press ctrl-c to stop");
	console.log("");
};

function serve(req, res, next) {
	if (req.url.split("?")[0] != "/") {
		return next();
	}
	
	var model = {
		shout: JSON.stringify({
			version: version,
			mode: config("mode")
		})
	};
	
	return fs.readFile(
		"client/index.html",
		"utf-8",
		function(err, file) {
			if (!err) {
				res.end(_.template(file)(model));
			}
		}
	);
}
