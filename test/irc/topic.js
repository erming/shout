var tape = require("tape");
var events = require("events");
var topic = require("../../src/irc/topic");
var Chan = require("../../src/models/chan");

tape("topic", function(t) {
	t.plan(2);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			t.pass();
			break;

		case "topic":
			if (msg.topic == "foo") {
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

	topic(irc, client, network);

	irc.emit("topic", {
		channel: "#bar",
		nick: "",
		topic: "foo"
	});

	t.end();
});
