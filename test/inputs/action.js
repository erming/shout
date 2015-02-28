var tape = require("tape");
var action = require("../../src/inputs/action");

tape("action", function(t) {
  t.plan(1);

  var irc = {};
  irc.action = function(chan, text) {
    if (chan == "#chan" && text == "is running a test") {
      t.pass();
    }
  };

  var input = {
    cmd: "me",
    args: ["is", "running", "a", "test"]
  };

  var target = {
    chan: {
      name: "#chan"
    }
  };

  action(irc, null, target, input);

  t.end();
});
