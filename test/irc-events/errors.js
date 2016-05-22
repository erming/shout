var tape = require("tape");
var events = require("events");
var error = require("../../src/irc-events/errors");

tape("error", function(t) {
	t.plan(3);

	var irc = new events.EventEmitter();
	irc.me = "foo";
	irc.nick = function(n) {
		t.assert(n);
	};

	var client = {};
	client.emit = function(e, msg) {
		if (e == "msg" && msg.chan == 0 && msg.msg.text == "foo") {
			t.pass();
		}
	};

	var network = {
		connected: false,
		channels: [{
			id: 0,
			name: "#chan"
		}]
	};

	error(irc, client, network);

	irc.emit("errors", {
		message: "foo"
	});

	irc.emit("errors", {
		cmd: "ERR_NICKNAMEINUSE",
		message: "foo"
	});

	t.end();
});
