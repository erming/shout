var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("motd", function(data) {
		var motd = data.motd;
		var chan = network.channels[0];
		motd.forEach(function(text) {
			var msg = new Msg({
				type: Msg.Type.MOTD,
				text: text
			});
			chan.messages.push(msg);
			client.emit("msg", {
				chan: chan.id,
				msg: msg
			});
		});
	});
};
