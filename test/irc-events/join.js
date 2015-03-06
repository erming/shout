var tape = require("tape");
var events = require("events");
var join = require("../../src/irc-events/join");

tape("join", function(t) {
  t.plan(5);

  var irc = new events.EventEmitter();
  irc.me = "foo";

  var i = 0;
  var client = {};
  client.emit = function(e, msg) {
    switch (e) {
    case "join":
      t.pass();
      break;

    case "msg":
      t.pass();
      break;

    case "users":
      t.pass();
      break;
    }
    i++;
  };

  var network = {
    channels: []
  };

  join(irc, client, network);

  irc.emit("join", {
    nick: "foo",
    channel: "#chan"
  });

  irc.emit("join", {
    nick: "bar",
    channel: "#chan"
  });

  t.end();
});
