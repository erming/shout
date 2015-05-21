var tape = require("tape");
var glob = require("glob");
var index = require("../../src/irc-events");

tape("error", function(t) {
  t.plan(1);

  var find = glob.sync("src/irc-events/*.js").length;
  t.equals(index.length, find - 1);

  t.end();
});
