var _ = require("lodash");
var User = require("../models/user");

module.exports = function(irc, client, network) {
	irc.on("names", function(data) {
		var chan = _.find(network.channels, {name: data.channel});
		if (!chan) {
			return;
		}

		var users = data.names;

		chan.users = [];
		users.forEach(function(u) {
			chan.users.push(new User(u));
		});

		client.emit("users", {
			chan: chan.id,
			users: chan.users
		});
	});
};
