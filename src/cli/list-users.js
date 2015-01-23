var program = require("commander");

program
  .command("list-users")
  .action(list);

function list() {
  console.log("Command 'list-users' triggered.");
}
