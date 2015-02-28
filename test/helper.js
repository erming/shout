var tape = require("tape");
var path = require("path");
var helper = require("../src/helper");

tape("helper", function(t) {
  t.plan(4);

  var h = helper.HOME;
  var p = helper.path("foo");

  t.equals(typeof h, "string");
  t.assert(h != "");

  t.equals(p, path.join(h, "/foo"));
  t.equals(p, path.join(h + "/", "foo"));

  t.end();
});
