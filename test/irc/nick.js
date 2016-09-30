var tape = require("tape");
var events = require("events");
var nick = require("../../src/irc/nick");
var Chan = require("../../src/models/chan");
var User = require("../../src/models/user");

tape("nick", function(t) {
	t.plan(5);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			t.pass();
			break;

		case "nick":
			if (typeof msg.network !== "undefined") {
				if (msg.nick == "baz") {
					t.pass();
				}
			} else {
				if ((msg.prev == "foo" && msg.nick == "baz") || (msg.prev == "bar" && msg.nick == "foo")) {
					t.pass();
				}
			}
			break;
		}
	};

	var network = {
		id: 0,
		channels: [new Chan({
			name: "#bar",
			users: [
				new User({name: "foo"}),
				new User({name: "bar"}),
			]
		})]
	};

	nick(irc, client, network);

	irc.emit("nick", {
		nick: "foo",
		"new": "baz"
	});

	irc.emit("nick", {
		nick: "bar",
		"new": "foo"
	});

	t.end();
});
