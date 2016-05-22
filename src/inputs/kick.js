module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "kick") {
		return;
	}

	if (args.length) {
		irc.kick(target.chan, args[0]);
	}
};
