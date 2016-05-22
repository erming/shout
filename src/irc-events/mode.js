var _ = require("lodash");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("mode", function(data) {
		var target = data.target;
		var from = data.nick;
		var chan = _.findWhere(
			network.channels, {
				name: target
			}
		);

		if (!chan) {
			return;
		} else {
			if (from.indexOf(".") !== -1) {
				from = target;
			}
		}

		var mode = data.mode;
		var user = data.client;

		client.emit("mode", {
			chan: chan.id,
			mode: mode,
			user: user
		});

		var msg = new Msg({
			type: Msg.Type.MODE,
			from: from,
			text: mode + " " + user
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
