var program = require("commander");

module.exports = add;

program.command("add-user <name>").action(add);

function add(name) {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'add-user' not implemented yet.");
	console.log("");
}
