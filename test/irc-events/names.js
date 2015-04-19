var tape = require("tape");
var events = require("events");
var names = require("../../src/irc-events/names");
var Chan = require("../../src/models/chan");

tape("names", function(t) {
  t.plan(1);

  var irc = new events.EventEmitter();
  irc.me = "foo";

  var client = {};
  client.emit = function(e, msg) {
    switch (e) {
    case "users":
      var users = msg.users;
      if (users.length == 3) {
        t.pass();
      }
      break;
    }
  };

  var network = {
    id: 0,
    channels: [new Chan({
      name: "#bar"
    })]
  };

  names(irc, client, network);

  irc.emit("names", {
    channel: "#bar",
    names: [
      {name: "foo", mode: ""},
      {name: "bar", mode: ""},
      {name: "baz", mode: ""}
    ]
  });

  t.end();
});
