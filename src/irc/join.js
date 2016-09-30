var _ = require("lodash");
var Chan = require("../models/chan");
var Msg = require("../models/msg");
var User = require("../models/user");

module.exports = function(irc, client, network) {
	irc.on("join", function(data) {
		var chan = _.find(
			network.channels,
			{name: data.channel}
		);

		if (!chan) {
			chan = new Chan({name: data.channel});
			network.channels.push(chan);
			client.emit("join", {
				network: network.id,
				chan: chan
			});
		}

		var nick = data.nick;
		var users = chan.users;

		var user = new User({name: data.nick});
		users.push(user);
		client.emit("users", {
			chan: chan.id,
			users: users
		});

		var msg = new Msg({
			from: data.nick,
			type: Msg.Type.JOIN
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
