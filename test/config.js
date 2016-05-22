var tape = require("tape");
var config = require("../src/config");

tape("config", function(t) {
	t.plan(2);

	var n = config("");
	var p = config("port");

	t.false(n);
	t.equal(typeof p, "number");

	t.end();
});
