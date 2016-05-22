module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "join") {
		return;
	}

	if (args.length) {
		irc.join(args[0], args[1]);
	}
};
