var _ = require("lodash");
var cheerio = require("cheerio");
var Msg = require("../../models/msg");
var request = require("request");
var Helper = require("../../helper");

module.exports = function(irc, network) {
	var client = this;
	irc.on("message", function(data) {
		var config = Helper.getConfig();
		if (!config.prefetch) {
			return;
		}

		var links = [];
		var split = data.message.split(" ");
		_.each(split, function(w) {
			var match = w.indexOf("http://") === 0 || w.indexOf("https://") === 0;
			if (match) {
				links.push(w);
			}
		});

		if (links.length === 0) {
			return;
		}

		var self = data.to.toLowerCase() == irc.me.toLowerCase();
		var chan = _.findWhere(network.channels, {name: self ? data.from : data.to});
		if (typeof chan === "undefined") {
			return;
		}

		var msg = new Msg({
			type: Msg.Type.TOGGLE,
			time: ""
		});
		chan.messages.push(msg);
		client.emit("msg", {
			chan: chan.id,
			msg: msg
		});

		var link = links[0];
		fetch(link, function(res) {
			parse(msg, link, res, client);
		});
	});
};

function type(str) {
	return str.split(/ *; */).shift();
}

function parse(msg, url, res, client) {
	var toggle = msg.toggle = {
		id: msg.id,
		type: "",
		head: "",
		body: "",
		thumb: "",
		link: url
	};

	var contentType = type(res.headers['content-type'] || '');

	switch (contentType) {
	case "text/html":
		var $ = cheerio.load(res.body);
		toggle.type = "link";
		toggle.head = $("title").text();
		toggle.body =
			   $('meta[name=description]').attr('content')
			|| $('meta[property="og:description"]').attr('content')
			|| "No description found.";
		toggle.thumb =
			   $('meta[property="og:image"]').attr('content')
			|| $('meta[name="twitter:image:src"]').attr('content')
			|| "";
		break;

	case "image/png":
	case "image/gif":
	case "image/jpg":
	case "image/jpeg":
		toggle.type = "image";
		break;

	default:
		return;
	}

	client.emit("toggle", toggle);
}

function fetch(url, cb) {
	request(url, function(err, res) {
		if(err) {
			return;
		}
		cb(res);
	});
}
