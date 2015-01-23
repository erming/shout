var program = require("commander");
var shout = require("../shout");

program
  .command("start")
  .action(start);

function start() {
  shout();
}
