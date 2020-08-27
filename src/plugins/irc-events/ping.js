module.exports = function(irc, network) {
	var ping_check = function(irc) {
		console.log("Client#PING timeout check");
		irc.write("PING " + network.host); // connection is lost, send PING to confirm it and trigger error
	};

	irc.ptimer = setTimeout(ping_check, 300000, irc);

	irc.on("data", function(data) {
		if ("PING" === data.command) {
			clearTimeout(irc.ptimer);
			irc.ptimer = setTimeout(ping_check, 300000, irc);
		}
	});
};
