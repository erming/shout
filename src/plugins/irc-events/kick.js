var _ = require("lodash");
var Msg = require("../../models/msg");

module.exports = function(irc, network) {
	var client = this;
	irc.on("kick", function(data) {
		var from = data.nick;
		var chan = _.find(network.channels, {name: data.channel});
		var mode = chan.getMode(from);

		if (typeof chan === "undefined") {
			return;
		}

		if (data.client === irc.me) {
			chan.users = [];
		} else {
			chan.users = _.without(chan.users, _.find(chan.users, {name: data.client}));
		}

		client.emit("users", {
			chan: chan.id,
			users: chan.users
		});

		var self = false;
		if (data.nick.toLowerCase() === irc.me.toLowerCase()) {
			self = true;
		}
		var reason = data.message || "";
		if (reason.length > 0) {
			reason = " (" + reason + ")";
		}
		var msg = new Msg({
			type: Msg.Type.KICK,
			mode: mode,
			from: from,
			text: data.client + reason,
			self: self
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
