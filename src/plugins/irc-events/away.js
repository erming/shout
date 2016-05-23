var _ = require("lodash");
var Chan = require("../../models/chan");
var Msg = require("../../models/msg");

module.exports = function(irc, network) {
	var client = this;
	irc.on("away", function(data) {
		var chan = _.findWhere(network.channels, {name: data.nick});
		if (typeof chan === "undefined") {
			return;
		}

		var msg = new Msg({
			type: Msg.Type.WHOIS,
			from: data.nick,
			text: "is away: " + data.message
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});
	});
};
