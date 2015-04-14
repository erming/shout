var fs = require("fs");
var mkdirp = require("mkdirp");
var moment = require("moment");
var Helper = require("./helper");

module.exports.write = function(user, network, chan, msg) {
	try {
		var path = Helper.HOME + "/logs/" + user + "/" + network;
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
		path + "/" + chan + ".log",
		line + "\n",
		function(e) {
			if (e) {
				console.log("Log#write():\n" + e)
			}
		}
	);
};

var redt = /^\[\d{4}\-\d{2}\-\d{2} (\d{2}:\d{2}:\d{2})\] /;
var rems = /^<([^>]+)> /;
var reus = /(\S*) */;

module.exports.parse = function(line){
    var pmatch = line.match(redt);
    var datetime = pmatch[1];
    var msg = { id: 0, time: datetime, self: false };
    line = line.substr(pmatch[0].length);
    if (line[0] === "*") {
        line = line.substr(2);
        if (line[0] !== " ") {
            pmatch = line.match(reus);
            msg.from = pmatch[0];
            line = line.substr(pmatch[0].length);
        } else {
            msg.from = "";
            line = line.substr(1);
        }
        pmatch = line.match(reus);
        msg.type = pmatch[0];
        msg.text = line.substr(pmatch[0].length);
    } else {
        pmatch = line.match(rems);
        msg.from = pmatch[1];
        msg.type = "message";
        msg.text = line.substr(pmatch[0].length);
    }
    return msg;
};
