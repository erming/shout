var program = require("commander");
var fs = require("fs");
var mkdirp = require("mkdirp");
var config = require("../config");
var helper = require("../helper");

module.exports = init;

program
	.command("init")
	.action(init);

function init() {
	var path = config.getPath();
	if (config.exists()) {
		console.log("");
		console.log("Error!");
		console.log("");
		console.log("Config already exists at " + path);
		console.log("");
	} else if (config.reset()) {
		console.log("");
		console.log("Success!");
		console.log("");
		console.log("Config created at " + path);
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
