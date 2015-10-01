var bcrypt = require("bcrypt-nodejs");
var Msg = require("../../models/msg");

module.exports = function(network, chan, cmd, args) {
	if (cmd !== "setpass") {
		return;
	}
	var client = this;
	var msg = new Msg({
		type: Msg.Type.ERROR,
		text: "You must specify your current password followed by a new password separated by a space."
	});
	if (args.length === 2) {
		var oldPassword = args[0];
		var password = args[1];
		if (!bcrypt.compareSync(oldPassword || "", client.config.password)) {
			msg = new Msg({
				type: Msg.Type.ERROR,
				text: "The current password you specified does not match your account password."
			});
		} else {
			var salt = bcrypt.genSaltSync(8);
			var hash = bcrypt.hashSync(password, salt);
			msg = new Msg({
				type: Msg.Type.ERROR,
				text: "Failed to update your password :-("
			});
			if (client.setPassword(hash)) {
				msg = new Msg({
					text: "Successfully updated your password :-)"
				});
			}
		}
	}
	var lobby = network.channels[0];
	lobby.messages.push(msg);
	client.emit("msg", {
		chan: lobby.id,
		msg: msg
	});
};
