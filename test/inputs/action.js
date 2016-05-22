var tape = require("tape");
var action = require("../../src/inputs/action");

tape("action", function(t) {
	t.plan(2);

	var irc = {};
	irc.action = function(chan, text) {
		if (chan == "#chan" && text == "is running a test") {
			t.pass();
		}
	};

	var inputs = [{
		cmd: "me",
		args: ["is", "running", "a", "test"]
	}, {
		cmd: "action",
		args: ["is", "running", "a", "test"]
	}];

	var target = {
		chan: {
			name: "#chan"
		}
	};

	for (var i in inputs) {
		action(irc, null, target, inputs[i]);
	}

	t.end();
});
