var program = require("commander");

program
	.command("remove-user")
	.action(remove);

/**
 * Remove a user by deleting their `user.json`. If the user is online, this
 * should also disconnect the user.
 *
 * @param {String} name
 * @api private
 */

function remove(name) {
	console.log("Command 'remove-user' triggered.");
}
