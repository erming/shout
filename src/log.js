var crypto = require("crypto");
var fs = require("fs");
var mkdirp = require("mkdirp");
var moment = require("moment");
var Cache = require("ttl");
var Helper = require("./helper");
var Msg = require("./models/msg");

var recent = new Cache({ ttl: 10 * 1000 });

function getLogPath(user, network, chan) {
	return Helper.HOME + "/logs/" + user + "/" + network;
}

function getLogFilename(chan) {
	return chan + ".log";
}

module.exports.load = function(nick, user, network, chan, callback) {
	var filename = getLogPath(user, network, chan) + "/" + getLogFilename(chan);

	fs.readFile(filename, function(err, data) {
		if (err) {
			callback();
			return;
		}

		var config = Helper.getConfig();
		var format = (config.logs || {}).format || "YYYY-MM-DD HH:mm:ss";
		var tz = (config.logs || {}).timezone || "UTC+00:00";

		var content = data.toString();
		var regex = /^\[(.*?)\] <(.*?)> (.*)([\n\r]+|$)/gm;
		var messages = [];
		var msg;

		while ((msg = regex.exec(content)) !== null) {
			messages.push(new Msg({
				type: Msg.Type.MESSAGE,
				mode: null,
				time: moment(msg[1], format).zone(tz).format("HH:mm:ss"),
				from: msg[2],
				text: msg[3],
				self: (msg[2].toLowerCase() == nick.toLowerCase())
			}));
		}

		callback(messages);
	});
}

module.exports.write = function(user, network, chan, msg) {
	var shasum = crypto.createHash("sha1");
	shasum.update(user || "");
	shasum.update(network || "");
	shasum.update(chan || "");
	shasum.update(msg.type || "");
	shasum.update(msg.from  || "");
	shasum.update(msg.text || "");
	var key = shasum.digest("hex");

	if (recent.get(key) !== undefined) {
		return;
        }

	recent.put(key, true);

	try {
		var path = getLogPath(user, network, chan);
		mkdirp.sync(path);
	} catch(e) {
		console.log(e);
		return;
	}

	var config = Helper.getConfig();
	var format = (config.logs || {}).format || "YYYY-MM-DD HH:mm:ss";
	var tz = (config.logs || {}).timezone || "UTC+00:00";

	var time = moment().zone(tz).format(format);
	var line = "[" + time + "] ";

	var type = msg.type.trim();
	if (type == "message" || type == "highlight") {
		// Format:
		// [2014-01-01 00:00:00] <Arnold> Put that cookie down.. Now!!
		line += "<" + msg.from + "> " + msg.text;
	} else {
		// Format:
		// [2014-01-01 00:00:00] * Arnold quit
		line += "* " + msg.from + " " + msg.type;
		if (msg.text) {
			line += " " + msg.text;
		}
	}

	fs.appendFile(
		path + "/" + getLogFilename(chan),
		line + "\n",
		function(e) {
			if (e) {
				console.log("Log#write():\n" + e)
			}
		}
	);
};

