var program = require("commander");

program
  .command("edit-user")
  .action(edit);

function edit(name) {
  console.log("Command 'edit-user' triggered.");
}
