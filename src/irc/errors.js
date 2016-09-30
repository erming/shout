var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("errors", function(data) {
		var id = 0;
		var chan = network.channels[0];
		if (chan) {
			id = chan.id;
		}

		var text = data.message;

		client.emit("msg", {
			chan: id,
			msg: new Msg({
				type: Msg.Type.ERROR,
				text: text
			})
		});

		if (!network.connected) {
			if (data.cmd == "ERR_NICKNAMEINUSE") {
				var nick = irc.me + Math.floor(10 + (Math.random() * 89));
				irc.nick(nick);
			}
		}
	});
};
