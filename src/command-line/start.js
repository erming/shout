var program = require("commander");
var shout = require("../shout");
var config = require("../config");

module.exports = start;

program
  .command("start")
  .action(start);

function start() {
  if (config.exists()) {
    shout();
  } else {
    console.log("");
    console.log("Error!");
    console.log("");
    console.log("Could not find " + config.getPath());
    console.log("Please run the init command.");
    console.log("");
    console.log("Example:");
    console.log("  shout init");
    console.log("");
  }
}
