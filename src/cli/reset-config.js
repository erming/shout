var program = require("commander");

module.exports = reset;

program.command("reset-config").action(reset);

function reset() {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'reset-config' not implemented yet.");
	console.log("");
}
