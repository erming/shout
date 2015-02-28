var program = require("commander");

module.exports = remove;

program
  .command("remove-user")
  .action(remove);

function remove(name) {
  console.log("Command 'remove-user' triggered.");
}
