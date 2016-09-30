var tape = require("tape");
var events = require("events");
var motd = require("../../src/irc/motd");
var Chan = require("../../src/models/chan");

tape("motd", function(t) {
	t.plan(4);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			if (msg.msg.text) {
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

	motd(irc, client, network);

	irc.emit("motd", {
		motd: ["this", "is", "the", "motd"]
	});

	t.end();
});
