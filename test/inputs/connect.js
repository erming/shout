var tape = require("tape");
var connect = require("../../src/inputs/connect");

tape("connect", function(t) {
	t.plan(1);

	var client = {};
	client.connect = function(args) {
		if (args.host == "foo") {
			t.pass();
		}
	};

	var input = {
		cmd: "connect",
		args: ["foo"]
	};

	connect(null, client, null, input);

	t.end();
});
