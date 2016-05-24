var tape = require("tape");
var helper = require("../src/helper");

tape("helper", function(t) {
	t.plan(2);
	
	helper.hash("foo", function(hash) {
		helper.compareHash("foo", hash, function(match) {
			t.true(match);
		});
	});
	
	helper.hash("bar", function(hash) {
		helper.compareHash("foo", hash, function(match) {
			t.false(match);
		});
	});
});
