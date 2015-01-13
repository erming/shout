var program = require("commander");

program
	.command("edit-config")
	.action(edit);

/**
 * Open the config in a text editor.
 *
 * @api private
 */

function edit() {
	console.log("Command 'add-user' triggered.");
}
