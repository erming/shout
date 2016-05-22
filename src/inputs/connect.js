module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "connect" && cmd != "server") {
		return;
	}

	if (args.length) {
		client.connect({host: args[0]});
	}
};
