var program = require("commander");
var version = require("../../package.json").version;

require("./add-user");
require("./edit-config");
require("./edit-user");
require("./list-users");
require("./remove-user");
require("./reset-config");
require("./reset-password");
require("./start");

program.version(version, "-v, --version");
program.option("-h, --help", help);

function help() {
  console.log("");
  console.log("Usage: shout <command>");
  console.log("");
  console.log("Where <command> is one of:");
  console.log("  add-user");
  console.log("  edit-config");
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

module.exports = {
  run: function() {
    var result = program.parse(process.argv);
    if (!result.args.length) {
      help();
    }
  }
};
