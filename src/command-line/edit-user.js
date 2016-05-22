var program = require("commander");

module.exports = edit;

program.command("edit-user <name>").action(edit);

function edit(name) {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'edit-user' not implemented yet.");
	console.log("");
}
