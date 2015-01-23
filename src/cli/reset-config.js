var program = require("commander");

program
  .command("reset-config")
  .action(reset);

function reset() {
  console.log("Command 'reset-config' triggered.");
}
