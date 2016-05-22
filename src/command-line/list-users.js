var program = require("commander");

module.exports = list;

program.command("list-users").action(list);

function list() {
	console.log("");
	console.log("Error!");
	console.log("");
	console.log("'list-users' not implemented yet.");
	console.log("");
}
