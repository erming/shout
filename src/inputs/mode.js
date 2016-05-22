module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "mode" && cmd != "op" && cmd != "voice" && cmd != "deop" && cmd != "devoice") {
		return;
	} else if (args.length === 0) {
		return;
	}

	var mode;
	var user;

	if (cmd != "mode") {
		user = args[0];
		mode = {
				 "op": "+o",
			"voice": "+v",
			 "deop": "-o",
		"devoice": "-v"
		}[cmd];
	} else if (args.length === 1) {
		return;
	} else {
		mode = args[0];
		user = args[1];
	}

	var chan = target.chan;
	irc.mode(
		chan,
		mode,
		user
	);
};
