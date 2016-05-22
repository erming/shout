var tape = require("tape");
var events = require("events");
var message = require("../../src/irc-events/message");
var Chan = require("../../src/models/chan");

tape("message", function(t) {
	t.plan(5);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			t.pass();
			var from = msg.msg.from;
			var text = msg.msg.text;
			if (from == "baz" && text == "foo") {
				t.pass();
			}
			break;

		case "join":
			t.pass();
			break;
		}
	};

	var network = {
		id: 0,
		channels: [new Chan({
			name: "#bar"
		})]
	};

	message(irc, client, network);

	irc.emit("message", {
		message: "foo",
		to: "#bar",
		from: "baz"
	});

	irc.emit("message", {
		message: "foo",
		to: "foo",
		from: "baz"
	});

	t.end();
});
