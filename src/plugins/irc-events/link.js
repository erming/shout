var _ = require("lodash");
var Msg = require("../../models/msg");
var Helper = require("../../helper");

module.exports = function(irc, network) {
	var client = this;
	irc.on("message", function(data) {
		var self = data.to.toLowerCase() == irc.me.toLowerCase();
		var chan = _.findWhere(network.channels, {name: self ? data.from : data.to});
		if (typeof chan === "undefined") {
			return;
		}

		var links = [];
		var split = data.message.split(" ");
		_.each(split, function(w) {
			if (/(http(s?))\:\/\//gi.test(w)) {
				links.push(w);
			}
		});

		if (_.isEmpty(links)) {
			return;
		}

		var msg = new Msg({
			type: Msg.Type.TOGGLE,
			time: ""
		});

		chan.messages.push(msg);

		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});

		_.each(links, function(url) {
			client.emit("toggle", { id: msg.id, link: url });
		});
	});
};
