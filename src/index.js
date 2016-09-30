var program = require("commander");
var version = require("../package.json").version;

require("./cli/add-user");
require("./cli/edit-config");
require("./cli/edit-user");
require("./cli/list-users");
require("./cli/remove-user");
require("./cli/reset-config");
require("./cli/reset-password");
require("./cli/start");

program.version(version, "-v, --version");
program.option("-h, --help");

function help() {
	console.log("");
	console.log("Usage: shout <command>");
	console.log("");
	console.log("Where <command> is one of:");
	console.log("  add-user");
	console.log("  edit-user");
	console.log("  help");
	console.log("  list-users");
	console.log("  remove-user");
	console.log("  reset-config");
	console.log("  reset-password");
	console.log("  start");
	console.log("  version");
	console.log("");
	console.log("Options:");
	console.log("  -h, --help");
	console.log("  -v, --version");
	console.log("");
	console.log("Example:");
	console.log("  shout start");
	console.log("  shout add-user <name>");
	console.log("");
	console.log("shout@" + version);
}

var result = program.parse(process.argv);
if (!result.args.length) {
	help();
}
