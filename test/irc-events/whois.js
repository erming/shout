var tape = require("tape");
var events = require("events");
var whois = require("../../src/irc-events/whois");
var Chan = require("../../src/models/chan");

tape("whois", function(t) {
	t.plan(4);

	var irc = new events.EventEmitter();
	irc.me = "foo";

	var client = {};
	client.emit = function(e, msg) {
		switch (e) {
		case "msg":
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

	whois(irc, client, network);

	irc.emit("whois", null, {
		hostname: "freenode.org",
		nickname: "foo",
		username: "foo",
		realname: "John Doe",
		channels: "#bar",
		server: "irc.freenode.org"
	});

	t.end();
});
