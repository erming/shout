var program = require("commander");

module.exports = edit;

program
  .command("edit-user")
  .action(edit);

function edit(name) {
  console.log("Command 'edit-user' triggered.");
}
