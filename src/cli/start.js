var program = require("commander");
var shout = require("../shout");

program
	.command("start")
	.action(start);

/**
 * Start the Shout server.
 *
 * @api private
 */

function start() {
	shout();
}
