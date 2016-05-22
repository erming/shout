module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "topic") {
		return;
	}

	var chan = target.chan;
	var msg = args.join(" ");

	irc.topic(
		chan,
		msg
	);
};
