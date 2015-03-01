var program = require("commander");

module.exports = edit;

program
  .command("edit-config")
  .action(edit);

function edit() {
  console.log("Command 'add-user' triggered.");
}
