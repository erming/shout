var program = require("commander");
var child = require("child_process");
var Manager = require("../manager");
var helper = require("../helper");

module.exports = edit;

program.command("edit-user <name>").action(edit);

function edit(name) {
	var manager = new Manager();
	manager.load("*");

	if (!manager.find(name)) {
		console.log("");
		console.log("Error!");
		console.log("");
		console.log("User '" + name + "' not found.");
		console.log("");
		return;
	}

	child.spawn(
		process.env.EDITOR || "vi",
		[require("path").join(helper.HOME, "users", name + ".json")],
		{stdio: "inherit"}
	);
}
