var tape = require("tape");
var whois = require("../../src/inputs/whois");

tape("whois", function(t) {
	t.plan(1);

	var irc = {};
	irc.whois = function(user) {
		if (user == "foo") {
			t.pass();
		}
	};

	var input = {
		cmd: "whois",
		args: ["foo"]
	};

	whois(irc, null, null, input);

	t.end();
});
