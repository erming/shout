var program = require("commander");
var Manager = require("../manager");

module.exports = list;

program.command("list-users").action(list);

function list() {
	var manager = new Manager();
	manager.load("*");
	manager.list().forEach(function(user) {
		console.log(user);
	});
}
