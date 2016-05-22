var Msg = require("../models/msg");

module.exports = function(irc, client, network) {
	irc.on("welcome", function(data) {
		var nick = data;
		var chan = network.channels[0];

		network.connected = true;
		irc.write("PING " + network.host);
		irc.me = nick;

		var msg = new Msg({
			text: "You're not known as " + nick
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
	});
};
