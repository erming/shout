var tape = require("tape");
var mode = require("../../src/inputs/mode");

tape("mode", function(t) {
  t.plan(2);

  var irc = {};
  irc.mode = function(chan, mode, user) {
    if (chan == "#chan" && mode == "+o" && user == "foo") {
      t.pass();
    }
  };

  var target = {
    chan: "#chan"
  };

  var foo = {
    cmd: "op",
    args: ["foo"]
  };

  var bar = {
    cmd: "mode",
    args: ["+o", "foo"]
  };

  mode(irc, null, target, foo);
  mode(irc, null, target, bar);

  t.end();
});
