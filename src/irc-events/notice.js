var _ = require("lodash");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("notice", function(data) {
		var to = data.to;
		if (to.toLowerCase() == irc.me.toLowerCase()) {
			to = data.from;
		}

		var chan = _.findWhere(
			network.channels,
			{name: to}
		);
		if (!chan) {
			chan = network.channels[0];
		}

		var from = data.from;
		if (data.to == "*" || data.from.indexOf(".") !== -1) {
			from = "";
		}

		var msg = new Msg({
			type: Msg.Type.NOTICE,
			from: from,
			text: data.message
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
