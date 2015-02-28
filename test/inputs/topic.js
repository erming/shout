var tape = require("tape");
var topic = require("../../src/inputs/topic");

tape("topic", function(t) {
  t.plan(1);

  var irc = {};
  irc.topic = function(chan, msg) {
    if (chan == "#chan" && msg == "foo") {
      t.pass();
    }
  };

  var target = {
    chan: "#chan"
  };

  var input = {
    cmd: "topic",
    args: ["foo"]
  };

  topic(irc, null, target, input);

  t.end();
});
