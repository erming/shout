var program = require("commander");

module.exports = reset;

program.command("reset-password <name>").action(reset);

function reset(name) {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'reset-password' not implemented yet.");
	console.log("");
}
