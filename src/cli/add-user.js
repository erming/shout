var program = require("commander");

program
  .command("add-user")
  .action(add);

function add(name, password) {
  console.log("Command 'add-user' triggered.");
}
