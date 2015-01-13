#!/usr/bin/env node
process.chdir(__dirname);

var fs = require("fs");
var program = require("commander");
var mkdirp = require("mkdirp");
var path = require("path");

require("./src/cli");

var home = process.env.HOME + "/.shout";
var config = home + "/config.js";

if (!fs.existsSync(config)) {
	mkdirp.sync(home);
	fs.writeFileSync(
		config,
		fs.readFileSync(
			__dirname + "/defaults/config.js"
		)
	);
};

program.parse(process.argv);
if (!program.args.length) {
	program.parse(process.argv.concat("start"));
}
