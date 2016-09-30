var Msg = require("../models/msg")

module.exports = function(irc, client, network) {
	irc.on("whois", function(err, data) {
		if (!data) {
			return;
		}

		var prefix = {
			hostname: "from",
			realname: "is",
			channels: "on",
			server: "using"
		};

		var chan = network.channels[0];
		var from = data.nickname;

		var i = 0;
		for (var k in data) {
			var key = prefix[k];
			if (!key || data[k].toString === "") {
				continue;
			}

			var msg = new Msg({
				type: Msg.Type.WHOIS,
				from: from,
				text: key + " " + data[k]
			});
			chan.messages.push(msg);
			client.emit("msg", {
				chan: chan.id,
				msg: msg
			});
		}
	});
};
