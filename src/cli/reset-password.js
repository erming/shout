var program = require("commander");

module.exports = reset;

program
  .command("reset-password")
  .action(reset);

function reset(name, password) {
  console.log("Command 'reset-password' triggered.");
}
