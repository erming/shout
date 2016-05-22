var program = require("commander");
var fs = require("fs");
var mkdirp = require("mkdirp");
var config = require("../config");
var helper = require("../helper");

module.exports = reset;

program
	.command("reset-config")
	.action(reset);

function reset() {
	var path = config.getPath();
	if (config.reset()) {
		console.log("");
		console.log("Success!");
		console.log("");
		console.log("Config has been reset.");
		console.log("");
	} else {
		console.log("");
		console.log("Error!");
		console.log("");
		console.log("You have no permissions to write to " + path);
		console.log("Try again as sudo.");
		console.log("");
	}
}
