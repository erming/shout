var program = require("commander");

program
	.command("edit-user")
	.action(edit);

/**
 * Open the user config in a text editor.
 *
 * @param {String} name
 * @api private
 */

function edit(name) {
	console.log("Command 'edit-user' triggered.");
}
