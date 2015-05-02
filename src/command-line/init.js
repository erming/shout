var program = require("commander");

module.exports = init;

program
  .command("init")
  .action(init);

function init() {
  console.log("Command 'init' triggered.");
}
