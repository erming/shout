var _ = require("lodash");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
  irc.on("topic", function(data) {
    var chan = _.findWhere(network.channels, {name: data.channel});
    if (!chan) {
      return;
    }

    var from = data.nick || chan.name;
    var topic = data.topic;

    chan.topic = topic;

    var msg = new Msg({
      type: Msg.Type.TOPIC,
      from: from,
      text: topic
    });
    chan.messages.push(msg),
    client.emit("msg", {
      chan: chan.id,
      msg: msg
    });

    client.emit("topic", {
      chan: chan.id,
      topic: _.escape(topic)
    });
  });
};
