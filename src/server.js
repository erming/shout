var _ = require("lodash");
var bcrypt = require("bcrypt");
var Client = require("./client");
var ClientManager = require("./clientManager");
var config = require("../config");
var express = require("express");
var fs = require("fs");
var io = require("socket.io");
var Helper = require("./helper");

var sockets = null;
var manager = new ClientManager();

module.exports = function(port, host, isPublic) {
	config.port = port;
	config.host = host;
	config.public = isPublic;

	var app = express()
		.use(index)
		.use(express.static("client"))
		.use(express.static(Helper.resolveHomePath("cache")));

	var server = null;
	var https = config.https || {};
	var protocol = https.enable ? "https" : "http";

	if (!https.enable){
		server = require("http");
		server = server.createServer(app).listen(port, host);
	} else {
		server = require("https");
		server = server.createServer({
			key: fs.readFileSync(https.key),
			cert: fs.readFileSync(https.certificate)
		}, app).listen(port, host)
	}

	sockets = io(server);
	sockets.on("connect", function(socket) {
		if (config.public) {
			auth.call(socket);
		} else {
			init(socket);
		}
	});

	manager.sockets = sockets;

	console.log("");
	console.log("Shout is now running on " + protocol + "://" + config.host + ":" + config.port + "/");
	console.log("Press ctrl-c to stop");
	console.log("");

	if (!config.public) {
		manager.loadUsers();
		if (config.autoload) {
			manager.autoload();
		}
	}
};

function index(req, res, next) {
	if (req.url != "/") return next();
	return fs.readFile("client/index.html", "utf-8", function(err, file) {
		var data = _.merge(
			require("../package.json"),
			config
		);
		res.setHeader("Content-Type", "text/html");
		res.writeHead(200);
		res.end(_.template(
			file,
			data
		));
	});
}

function init(socket, client, token) {
	if (!client) {
		socket.emit("auth", { allow_registration: config.allow_registration });
		socket.on("auth", auth);
		if (!config.public && config.allow_registration) {
			socket.on("register", register);
		}
	} else {
		socket.on(
			"input",
			function(data) {
				client.input(data);
			}
		);
		socket.on(
			"more",
			function(data) {
				client.more(data);
			}
		);
		socket.on(
			"conn",
			function(data) {
				client.connect(data);
			}
		);
		socket.on(
			"open",
			function(data) {
				client.open(data);
			}
		);
		socket.on(
			"sort",
			function(data) {
				client.sort(data);
			}
		);
		socket.join(client.id);
		socket.emit("init", {
			active: client.activeChannel,
			networks: client.networks,
			token: token || ""
		});
	}
}

function auth(data) {
	var socket = this;
	if (config.public) {
		var client = new Client(sockets);
		manager.clients.push(client);
		socket.on("disconnect", function() {
			manager.clients = _.without(manager.clients, client);
			client.quit();
		});
		init(socket, client);
	} else {
		var success = false;
		_.each(manager.clients, function(client) {
			if (data.token) {
				if (data.token == client.token) {
					success = true;
				}
			} else if (client.config.user == data.user) {
				if (bcrypt.compareSync(data.password || "", client.config.password)) {
					success = true;
				}
			}
			if (success) {
				var token;
				if (data.remember || data.token) {
					token = client.token;
				}
				init(socket, client, token);
				return false;
			}
		});
		if (!success) {
			if (!data.token) {
				socket.emit("auth", { allow_registration: config.allow_registration });
			}
		}
	}
}

function register(data) {
	var success = manager.addUser(data.user, data.password);
	if (success) {
		manager.loadUser(data.user);
		auth.call(this, data);
	} else {
		this.emit("auth", { allow_registration: config.allow_registration });
	}
}
