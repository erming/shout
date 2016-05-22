var tape = require("tape");
var events = require("events");
var notice = require("../../src/irc-events/notice");
var Msg = require("../../src/models/msg");

tape("notice", function(t) {
	t.plan(1);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
			var type = msg.msg.type;
			var text = msg.msg.text;
			if (type == Msg.Type.NOTICE && text == "foo") {
				t.pass();
			}
			break;
		}
	};

	var network = {
		id: 0,
		channels: [{
			messages: []
		}]
	};

	notice(irc, client, network);

	irc.emit("notice", {
		message: "foo",
		to: "bar",
		from: "baz"
	});

	t.end();
});
