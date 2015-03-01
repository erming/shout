var program = require("commander");

module.exports = list;

program
  .command("list-users")
  .action(list);

function list() {
  console.log("Command 'list-users' triggered.");
}
