var program = require("commander");
var fs = require("fs");
var helper = require("../helper");

module.exports = reset;

program
	.command("reset-password <name>")
	.action(reset);

function reset(name) {
	var path = helper.path("users/" + name + ".json");

	try {
		var file = fs.readFileSync(path);
	} catch(e) {
		console.log("");
		console.log("Error!");
		console.log("");
		console.log("User '" + name + "' not found.");
		console.log("");
		return;
	}

	var user = JSON.parse(file);

	require("read")({
		prompt: "Password: ",
		silent: true
	}, function(err, password) {
		if (!err) {
			var hash = helper.hash(password);
			user.password = hash;

			var json = JSON.stringify(user, null, "  ");
			var opts = {mode: "0777"};

			fs.writeFileSync(
				path,
				json,
				opts
			);

			console.log("");
			console.log("Success!");
			console.log("");
			console.log("Reset password for user '" + name + "'.");
			console.log("");
		}
	});
}
