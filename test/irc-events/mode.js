var tape = require("tape");
var events = require("events");
var mode = require("../../src/irc-events/mode");
var Chan = require("../../src/models/chan");
var User = require("../../src/models/user");

tape("mode", function(t) {
  t.plan(2);

  var irc = new events.EventEmitter();
  irc.me = "foo";

  var client = {};
  client.emit = function(e, msg) {
    switch (e) {
    case "msg":
      var from = msg.msg.from;
      var text = msg.msg.text;
      if (from == "bar" && text == "+v foo") {
        t.pass();
      }
      break;

    case "mode":
      var mode = msg.mode;
      var user = msg.user;
      if (mode == "+v" && user == "foo") {
        t.pass();
      }
      break;
    }
  };

  var network = {
    id: 0,
    channels: [new Chan({
      name: "#bar",
      users: [
        new User({name: "foo"}),
        new User({name: "bar"}),
      ]
    })]
  };

  mode(irc, client, network);

  irc.emit("mode", {
    target: "#bar",
    nick: "bar",
    mode: "+v",
    client: "foo"
  });

  t.end();
});
