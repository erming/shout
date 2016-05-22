var tape = require("tape");
var events = require("events");
var quit = require("../../src/irc-events/quit");
var Chan = require("../../src/models/chan");

tape("quit", function(t) {
	t.plan(2);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			t.pass();
			break;

		case "quit":
			if (msg.nick == "foo" && network.channels[0].users.length == 1) {
				t.pass();
			}
			break;
		}
	};

	var network = {
		id: 0,
		channels: [
			new Chan({name: "#foo", users: [
				{name: "foo"},
				{name: "bar"}
			]})
		]
	};

	quit(irc, client, network);

	irc.emit("quit", {
		nick: "foo",
	});

	t.end();
});
