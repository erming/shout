var _ = require("lodash");
var Chan = require("../../models/chan");
var Msg = require("../../models/msg");

module.exports = function(irc, network) {
	var client = this;
	irc.on("message", function(data) {
		if (!client.otrStore.isOtrMessage(data.message)) {
			return;
		}
		var otrSession = client.otrStore.getSession(data.from, network);
		otrSession.receiveMsg(data.message);
	});
};
