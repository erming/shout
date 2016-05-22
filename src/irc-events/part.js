var _ = require("lodash");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("part", function(data) {
		var chan = _.findWhere(network.channels, {name: data.channels[0]});
		if (!chan) {
			return;
		}

		var nick = data.nick;
		if (nick == irc.me) {
			network.channels = _.without(network.channels, chan);
		} else {
			var user = _.findWhere(chan.users, {name: nick});
			chan.users = _.without(chan.users, user);
		}

		var msg = new Msg({
			type: Msg.Type.PART,
			from: nick
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});

		client.emit("part", {
			chan: chan.id,
			nick: nick
		});
	});
};
