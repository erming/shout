var tape = require("tape");
var invite = require("../../src/inputs/invite");

tape("invite", function(t) {
	t.plan(1);

	var irc = {};
	irc.invite = function(chan, user) {
		if (chan == "#chan" && user == "foo") {
			t.pass();
		}
	};

	var input = {
		cmd: "invite",
		args: ["#chan", "foo"]
	};

	invite(irc, null, null, input);

	t.end();
});
