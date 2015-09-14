var _ = require("lodash");
var OTR = require('otr').OTR; // FIXME: remove this import

module.exports = function(network, chan, cmd, args) {
	if (cmd != "say" && cmd != "msg") {
		return;
	}
	if (args.length === 0 || args[0] === "") {
		return;
	}
	var client = this;
	var irc = network.irc;
	var target = "";
	if (cmd == "msg") {
		target = args.shift();
		if (args.length === 0) {
			return;
		}
	} else {
		target = chan.name;
	}
	var msg = args.join(" ");
	var otrSession = client.otrStore.getSession(chan.name, network);
	if (otrSession && (otrSession.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED)) {
		otrSession.sendMsg(msg);
	} else {
		irc.send(target, msg);
	}
	var channel = _.find(network.channels, {name: target});
	if (typeof channel !== "undefined") {
		irc.emit("message", {
			from: irc.me,
			to: channel.name,
			message: msg
		});
	}
};
