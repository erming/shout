var _ = require("lodash");
var Chan = require("./chan");

module.exports = Network;

var id = 0;

function Network(args) {
	_.merge(this, _.extend({
		id: id++,
		irc: null,
		connected: false,
		name: "",
		host: "",
		port: 6667,
		tls: false,
		channels: [],
		password: "",
		username: "",
		realname: ""
	}, args));

	this.channels.push(new Chan({
		name: "",
		type: Chan.Type.LOBBY
	}));

	if (!this.name) {
		this.name = prettify(this.host);
	}
}

Network.prototype.toJSON = function() {
	return _.pick(this, ["id", "name", "channels"]);
};

function prettify(host) {
	var name = capitalize(host.split(".")[1]);
	if (!name) {
		name = host;
	}
	return name;
}

function capitalize(str) {
	if (typeof str === "string") {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
