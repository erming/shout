var program = require("commander");

module.exports = edit;

program
  .command("list-users")
  .action(list);

function list() {
  console.log("Command 'list-users' triggered.");
}
