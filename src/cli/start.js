var program = require("commander");

program
	.command("start")
	.action(start);

/**
 * Start the Shout server.
 *
 * @api private
 */

function start() {
	console.log("Command 'start' triggered.");
}
