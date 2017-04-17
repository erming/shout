#!/usr/bin/env node
var forever = require("forever-monitor");
process.chdir(__dirname);

var child = new (forever.Monitor)("./src/command-line", {
	max: 50,
	args: []
});

child.on("exit", function(code) {
	console.log("Shout has exited with code: " + code);
});

child.on("restart", function() {
	console.error("Shout process restarted. Retart number: " + child.times);
});

child.startDaemon();
