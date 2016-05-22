var tape = require("tape");
var notice = require("../../src/inputs/notice");

tape("notice", function(t) {
	t.plan(1);

	var irc = {};
	irc.notice = function(to, msg) {
		if (to == "foo" && msg == "bar") {
			t.pass();
		}
	}

	var input = {
		cmd: "notice",
		args: ["foo", "bar"]
	};

	notice(irc, null, null, input);

	t.end();
});
