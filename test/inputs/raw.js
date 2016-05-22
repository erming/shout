var tape = require("tape");
var raw = require("../../src/inputs/raw");

tape("raw", function(t) {
	t.plan(1);

	var irc = {};
	irc.write = function(msg) {
		if (msg == "foo") {
			t.pass();
		}
	};

	var input = {
		cmd: "raw",
		args: ["foo"]
	};

	raw(irc, null, null, input);

	t.end();
});
