var tape = require("tape");
var events = require("events");
var welcome = require("../../src/irc/welcome");
var Chan = require("../../src/models/chan");

tape("welcome", function(t) {
	t.plan(3);

	var irc = new events.EventEmitter();
	irc.me = "foo";
	irc.write = function(msg) {
		t.pass();
	};

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			if (msg.msg.text) {
				t.pass();
			}
			break;

		case "nick":
			if (msg.network && msg.nick == "bar") {
				t.pass();
			}
			if (irc.me == "bar") {
				t.pass();
			}
			break;
		}
	};

	var network = {
		id: 0,
		channels: [new Chan({
			name: "#bar"
		})]
	};

	welcome(irc, client, network);

	irc.emit("welcome", "bar");

	t.end();
});
