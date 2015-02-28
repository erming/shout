var tape = require("tape");
var msg = require("../../src/inputs/msg");

tape("msg", function(t) {
  t.plan(2);

  var irc = {};
  irc.send = function(to, msg) {
    if (to == "#chan" && msg == "foo") {
      t.pass();
    }
  };

  var target = {
    chan: "#chan"
  };

  var bar = {
    cmd: "say",
    args: ["foo"]
  };

  var foo = {
    cmd: "msg",
    args: ["#chan", "foo"]
  };

  msg(irc, null, target, foo);
  msg(irc, null, target, bar);

  t.end();
});
