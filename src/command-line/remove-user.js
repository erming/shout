var program = require("commander");
var Manager = require("../manager");

module.exports = remove;

program
	.command("remove-user <name>")
	.action(remove);

function remove(name) {
	var remove = new Manager().remove(name);
	if (remove) {
		console.log("");
		console.log("Success!");
		console.log("");
		console.log("User '" + name + "' removed successfully.");
		console.log("");
	} else {
		console.log("");
		console.log("Error!");
		console.log("");
		console.log("User '" + name + "' not found.");
		console.log("");
	}
}
