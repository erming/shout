var _ = require("lodash");
var Msg = require("../../src/models/msg");

module.exports = function(irc, client, network) {
	irc.on("nick", function(data) {
		var nick = data["new"];
		var prev = data.nick;

		if (nick == irc.me) {
			var chan = network.channels[0];
			var msg = new Msg({
				text: "You're now known as " + nick
			});
			chan.messages.push(msg);
			client.emit("msg", {
				chan: chan.id,
				msg: msg
			});
			client.emit("nick", {
				network: network.id,
				nick: nick
			});
		}

		network.channels.forEach(function(chan) {
			var user = _.findWhere(chan.users, {name: prev});
			if (!user) {
				return;
			} else {
				user.name = nick;
			}

			var msg = new Msg({
				type: Msg.Type.NICK,
				from: prev,
				text: nick
			});
			chan.messages.push(msg);
			client.emit("msg", {
				chan: chan.id,
				msg: msg
			});

			client.emit("nick", {
				chan: chan.id,
				prev: prev,
				nick: nick
			});
		});
	});
};
