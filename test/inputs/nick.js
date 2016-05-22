var tape = require("tape");
var nick = require("../../src/inputs/nick");

tape("nick", function(t) {
	 t.plan(1);

	var irc = {};
	irc.nick = function(nick) {
		if (nick == "foo") {
			t.pass();
		}
	};

	var input = {
		cmd: "nick",
		args: ["foo"]
	};

	nick(irc, null, null, input);

	t.end();
});
