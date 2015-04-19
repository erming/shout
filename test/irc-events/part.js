var tape = require("tape");
var events = require("events");
var part = require("../../src/irc-events/part");
var Chan = require("../../src/models/chan");

tape("part", function(t) {
  t.plan(4);

  var irc = new events.EventEmitter();
  irc.me = "foo";

  var client = {};
  client.emit = function(e, msg) {
    switch (e) {
    case "msg":
      t.pass();
      break;

    case "part":
      if (msg.nick == irc.me) {
        var channels = network.channels;
        if (channels.length == 1) {
          t.pass();
        }
      } else {
        var users = network.channels[0].users;
        if (users.length == 1) {
          t.pass();
        }
      }
      break;
    }
  };

  var network = {
    id: 0,
    channels: [
      new Chan({name: "#foo", users: [{name: "foo"}, {name: "bar"}]}),
      new Chan({name: "#bar", users: [{name: "foo"}, {name: "bar"}]})
    ]
  };

  part(irc, client, network);

  irc.emit("part", {
    nick: "foo",
    channels: ["#foo"]
  });

  irc.emit("part", {
    nick: "bar",
    channels: ["#bar"]
  });

  t.end();
});
