var _ = require("lodash");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("quit", function(data) {
		network.channels.forEach(function(chan) {
			var nick = data.nick;
			var user = _.find(chan.users, {name: nick});
			if (!user) {
				return;
			}

			chan.users = _.without(chan.users, user);

			var msg = new Msg({
				type: Msg.Type.QUIT,
				from: nick
			});
			chan.messages.push(msg);
			client.emit("msg", {
				chan: chan.id,
				msg: msg
			});

			client.emit("quit", {
				chan: chan.id,
				nick: nick
			});
		});
	});
};
