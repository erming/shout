var _ = require("lodash");
var Chan = require("../models/chan");
var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("message", function(data) {
		var msg = data.message;
		if (msg.indexOf("\u0001") === 0 && msg.substring(0, 7) != "\u0001ACTION") {
			// Hide ctcp messages.
			return;
		}

		var from = data.from;
		var target = data.to;
		if (target.toLowerCase() == irc.me.toLowerCase()) {
			target = from;
		}

		var chan = _.find(
			network.channels, {name: target}
		);
		if (!chan) {
			chan = new Chan({
				type: Chan.Type.QUERY,
				name: from
			});
			network.channels.push(chan);
			client.emit("join", {
				network: network.id,
				chan: chan
			});
		}

		var type = "";
		var text = msg;
		if (text.split(" ")[0] == "\u0001ACTION") {
			type = Msg.Type.ACTION;
			text = text.replace(/^\u0001ACTION|\u0001$/g, "");
		}

		var msg = new Msg({
			type: type || Msg.Type.MESSAGE,
			from: from,
			text: text
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
