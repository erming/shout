var program = require("commander");

program
  .command("remove-user")
  .action(remove);

function remove(name) {
  console.log("Command 'remove-user' triggered.");
}
