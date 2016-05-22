var tape = require("tape");
var kick = require("../../src/inputs/kick");

tape("kick", function(t) {
	t.plan(1);

	var irc = {};
	irc.kick = function(chan, user) {
		if (chan == "#chan" && user == "foo") {
			t.pass();
		}
	};

	var target = {
		chan: "#chan"
	};

	var input = {
		cmd: "kick",
		args: ["foo"]
	};

	kick(irc, null, target, input);

	t.end();
});
