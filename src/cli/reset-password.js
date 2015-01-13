var program = require("commander");

program
	.command("reset-password")
	.action(reset);

/**
 * Reset the password for a user. This is done by overwriting the
 * current password in their user.json.
 *
 * @param {String} name
 * @param {String} password
 * @api private
 */

function reset(name, password) {
	console.log("Command 'reset-password' triggered.");
}
