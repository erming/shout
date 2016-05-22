var tape = require("tape");
var helper = require("../src/helper");

tape("helper", function(t) {
	t.plan(1);
	
	var hash = helper.hash("foo");
	var compare = helper.compareHash("foo", hash);
	
	t.true(compare);
	
	t.end();
});
