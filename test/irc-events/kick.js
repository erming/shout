var tape = require("tape");
var events = require("events");
var kick = require("../../src/irc-events/kick");
var Msg = require("../../src/models/msg");
var User = require("../../src/models/user");

tape("kick", function(t) {
	t.plan(6);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var i = 0;
	var client = {};
	client.emit = function(e, msg) {
		if (e == "msg") {
			if (msg.msg.type == Msg.Type.KICK) {
				t.pass()
			}
			return;
		} else if (e != "users") {
			return;
		}

		switch (i) {
		case 0:
			t.equals(msg.chan, 0);
			t.equals(msg.users.length, 2);
			break;

		case 1:
			t.equals(msg.chan, 0);
			t.equals(msg.users.length, 0);
			break;
		}

		i++;
	};

	var network = {
		channels: [{
			id: 0,
			name: "#chan",
			messages: [],
			users: [
				new User({name: "foo"}),
				new User({name: "bar"}),
				new User({name: "baz"})
			]
		}]
	};

	kick(irc, client, network);

	irc.emit("kick", {
		client: "baz",
		channel: "#chan"
	});

	irc.emit("kick", {
		client: "foo",
		channel: "#chan"
	});

	t.end();
});
