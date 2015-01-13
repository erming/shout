var program = require("commander");

program
	.command("add-user")
	.action(add);

/**
 * Create a user by adding a `user.json` file to the
 * `~/.shout/users/` folder.
 *
 * @param {String} name
 * @param {String} password
 * @api private
 */

function add(name, password) {
	console.log("Command 'add-user' triggered.");
}
