var test = require("tape");
var config = require("../src/config");

test("get()", function(t) {
  t.false(config(""), "should be false");
  t.equal(typeof config("port"), "number");
  t.end();
});
