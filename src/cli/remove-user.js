var program = require("commander");

module.exports = remove;

program.command("remove-user <name>").action(remove);

function remove(name) {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'remove-user' not implemented yet.");
	console.log("");
}
