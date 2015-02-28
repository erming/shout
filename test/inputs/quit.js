var tape = require("tape");
var quit = require("../../src/inputs/quit");

tape("quit", function(t) {
  t.plan(2);

  var irc = {};
  irc.quit = function(msg) {
    if (msg == "foo") {
      t.pass();
    }
  };

  var client = {};
  client.quit = function(network) {
    if (network == "foo") {
      t.pass();
    }
  };

  var target = {
    network: "foo"
  };

  var input = {
    cmd: "quit",
    args: ["foo"]
  };

  quit(irc, client, target, input);

  t.end();
});
