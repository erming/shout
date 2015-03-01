var program = require("commander");

module.exports = add;

program
  .command("add-user")
  .action(add);

function add(name, password) {
  console.log("Command 'add-user' triggered.");
}
