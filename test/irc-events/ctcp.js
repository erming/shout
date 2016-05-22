var tape = require("tape");
var events = require("events");
var ctcp = require("../../src/irc-events/ctcp");
var pkg = require("../../package.json");

tape("ctcp", function(t) {
	t.plan(2);

	var irc = new events.EventEmitter();
	irc.me = "foo";
	irc.ctcp = function(a, b) {
		if (b.indexOf("VERSION") == 0 || b.indexOf("PING") == 0) {
			t.pass();
		}
	};

	ctcp(irc, null, null);

	irc.emit("message", {
		from: "foo",
		message: "\001VERSION"
	});

	irc.emit("message", {
		from: "foo",
		message: "\001PING 123"
	});

	t.end();
});
