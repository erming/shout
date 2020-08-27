var ClientManager = new require("../clientManager");
var program = require("commander");
var shout = require("../server");
var Helper = require("../helper");
var path = require("path");

program
	.option("-H, --host <ip>"   , "host")
	.option("-P, --port <port>" , "port")
	.option("-B, --bind <ip>"   , "bind")
	.option("    --public"      , "mode")
	.option("    --private"     , "mode")
	.option("    --silent"      , "suppress errors about pid file creation")
	.command("start")
	.description("Start the server")
	.action(function() {
		var users = new ClientManager().getUsers();
		var config = Helper.getConfig();
		var mode = config.public;

		if (config.pidFile) {
			// setup exception handler to cleanup pid file and log errors
			process.on("uncaughtException", function(e) {
				console.log("uncaughtException: " + e.stack || e);
				process.exit(1);
			});

			// setup signal handlers to cleanly exit process
			// which allows the pid file to be removed
			process.on("SIGINT", process.exit.bind(process, 0));
			process.on("SIGTERM", process.exit.bind(process, 0));

			// use the default pid file name if the configuration
			// variable is not a string
			if (typeof config.pidFile !== "string") {
				config.pidFile = "shout.pid";
			}

			// get the absolute path of the pid file to use
			var pidFilePath = path.resolve(Helper.HOME, config.pidFile);

			// attempt to create the pid file or die trying
			try {
				var pid = require("npid").create(pidFilePath);
				pid.removeOnExit();
			} catch (e) {
				// spit out an error message about pid file creation
				if (!program.silent) {
					console.log("unable to create pid file: " + pidFilePath);
					console.log(e.stack || e);
				}

				// process is already running, so bail out now
				process.exit(1);
			}
		}

		if (program.public) {
			mode = true;
		} else if (program.private) {
			mode = false;
		}
		if (!mode && !users.length) {
			console.log("");
			console.log("No users found!");
			console.log("Create a new user with 'shout add <name>'.");
			console.log("");
		} else {
			shout({
				host: program.host || process.env.IP   || config.host,
				port: program.port || process.env.PORT || config.port,
				bind: program.bind || config.bind,
				public: mode
			});
		}
	});
