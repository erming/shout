module.exports = function(irc, client, target, input) {
	var cmd = input.cmd;
	var args = input.args;

	if (cmd != "notice") {
		return;
	}

	if (args.length > 1) {
		irc.notice(args[0], args.slice(1).join(" "));
	}
};
