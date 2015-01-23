#!/usr/bin/env node
process.chdir(__dirname);

var program = require("commander");
var cli = require("./src/cli");

program.parse(process.argv);
if (!program.args.length) {
	program.parse(process.argv.concat("start"));
}
