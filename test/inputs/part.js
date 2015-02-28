var tape = require("tape");
var part = require("../../src/inputs/part");

tape("part", function(t) {
  t.plan(2);

  var irc = {};
  irc.part = function(channels) {
    if (channels[0] == "#chan") {
      t.pass();
    }
  };

  var target = {
    chan: "#chan"
  };

  var foo = {
    cmd: "part",
    args: []
  };

  var bar = {
    cmd: "part",
    args: ["#chan"]
  };

  part(irc, null, target, foo);
  part(irc, null, target, bar);

  t.end();
});
