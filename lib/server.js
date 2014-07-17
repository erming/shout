/**
 * Module dependencies
 */

// 3rd-party
var _ = require("lodash");
var http = require("connect");
var io = require("socket.io");

// app
var Client = require("./client");


var sockets = null;
var clients = [];

var inputs = [
	"action",
	"connect",
	"invite",
	"join",
	"kick",
	"mode",
	"msg",
	"nick",
	"notice",
	"part",
	"quit",
	"raw",
	"topic",
	"whois"
];

module.exports = server.bind(server);

function server(config) {

	this.config = config;

	sockets = io(http().use(http.static("client")).listen(this.config.port || 9000));

	sockets.on("connect", function(socket) {

		this.socket = socket;

		if (this.config.public) {
			this.auth();
		} else {
			this.init(socket);
		}
	}.bind(this));
};

server.init = function(socket, client) {

	if (!client) {
		socket.emit("auth");
		socket.on("auth", auth);
	} else {
		socket.on(
			"input",
			function(data) {
				this.input(client, data);
			}.bind(this)
		);
		socket.on(
			"conn",
			function(data) {
				client.connect(data);
			}
		);
		socket.join(client.id);
		socket.emit("init", {
			networks: client.networks
		});
	}
};

server.auth = function(data) {

	if (this.config.public) {
		var client = new Client(sockets);
		clients.push(client);

		this.socket.on("disconnect", function() {
			clients = _.without(clients, client);
			client.quit();
		});
		this.init(this.socket, client);
	} else {
		if (false) {
			// ..
		}
	}
};

server.input = function(client, data) {
	var target = client.find(data.target);

	var text = data.text;
	if (text.charAt(0) !== "/") {
		text = "/say " + text;
	}

	var args = text.split(" ");
	var cmd = args.shift().replace("/", "").toLowerCase();

	inputs.forEach(function(plugin) {
		try {
			var fn = require("./plugins/inputs/" + plugin);
			fn.apply(client, [
				target.network,
				target.chan,
				cmd,
				args
			]);
		} catch (err) {
			// ..
		}
	});
};
