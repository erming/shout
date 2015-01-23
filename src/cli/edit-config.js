var program = require("commander");

program
  .command("edit-config")
  .action(edit);

function edit() {
  console.log("Command 'add-user' triggered.");
}
