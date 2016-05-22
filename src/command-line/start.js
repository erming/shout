var program = require("commander");
var shout = require("../shout");
var config = require("../config");

module.exports = start;

program.command("start").action(start);

function start() {
	shout();
}
