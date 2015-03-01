var program = require("commander");

module.exports = reset;

program
  .command("reset-config")
  .action(reset);

function reset() {
  console.log("Command 'reset-config' triggered.");
}
