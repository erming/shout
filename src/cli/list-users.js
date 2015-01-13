var program = require("commander");

program
	.command("list-users")
	.action(list);

/**
 * List all the users in the console.
 *
 * @api private
 */

function list() {
	console.log("Command 'list-users' triggered.");
}
