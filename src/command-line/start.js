var config = require("../../config");
var ClientManager = new require("../clientManager");
var program = require("commander");
var shout = require("../server");

program
	.option("-H, --host <ip>", "host")
	.option("-p, --port <port>", "port")
	.option("    --public", "mode")
	.option("    --private", "mode")
	.command("start")
	.description("Start the server")
	.action(function() {
		var users = new ClientManager().getUsers();
		var isPublic = config.public;
		if (program.public) {
			isPublic = true;
		} else if (program.private) {
			isPublic = false;
		}
		if (!isPublic && !config.allow_registration && !users.length) {
			console.log("");
			console.log("No users found!");
			console.log("Create a new user with 'shout add <name>'.");
			console.log("");
		} else {
			var host = program.host || process.env.IP || config.host;
			var port = program.port || process.env.PORT || config.port;
			shout(port, host, isPublic);
		}
	});
