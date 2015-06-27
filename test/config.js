var tape = require("tape");
var config = require("../src/config");

if (!config.exists()) {
  // Create config if it does not already exist.
  config.reset();
}

tape("config", function(t) {
  t.plan(3);

  var exists = config.exists();
  var n = config("");
  var p = config("port");

  t.true(exists);
  t.false(n);
  t.equal(typeof p, "number");

  t.end();
});
