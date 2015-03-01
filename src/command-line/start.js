var program = require("commander");
var shout = require("../shout");

module.exports = start;

program
  .command("start")
  .action(start);

function start() {
  shout();
}
