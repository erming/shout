var tape = require("tape");
var join = require("../src/inputs/join");

tape("join", function(t) {
  t.plan(1);

  var irc = {};
  irc.join = function(chan) {
    if (chan == "#chan") {
      t.pass();
    }
  };

  var input = {
    cmd: "join",
    args: ["#chan"]
  };

  join(irc, null, null, input);
});
