var program = require("commander");
var child = require("child_process");
var helper = require("../helper");

module.exports = edit;

program
	.command("edit-config")
	.action(edit);

function edit() {
	child.spawn(
		process.env.EDITOR || "vi",
		[require("path").join(helper.HOME, "config.json")],
		{stdio: "inherit"}
	);
}
