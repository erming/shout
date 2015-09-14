var _ = require("lodash");
var OTR = require('otr').OTR;
var Chan = require("./chan");

module.exports = OtrStore;

/**
 * Stores OTR state for a given user
 *
 * Handles current sessions.
 */
function OtrStore(name, client) {
	this.name = name;
	this.session = {};
	// Do not use the _.merge "pattern" : we want shallow copy
	this.client = client;
}

/**
 * Initializes an OTR session for query chans
 *
 * Event handler, to be called on chan creation
 */
OtrStore.prototype.initChan = function(args) {
	var network_id = args.network;
	var chan = args.chan;
	if (chan.type === Chan.Type.QUERY) {
		var network = _.find(this.client.networks, {id: network_id});
		var session = this.getSession(chan.name, network);
		var irc = network.irc;
		if (session === undefined) {
			session = new OTR({
				// After some tests, the only working value  with this lib and
				// node-otr4 lib as well
				fragment_size: 140, // chars

				// After some tests, a good value not get kicked, and to be
				// fast enough, at least on FreeNode.
				// (tested pasting 742 chars msg).
				send_interval: 50 // ms
			});

			// When OTR lib decoded a message :
			session.on('ui', function(msg, encrypted, meta) {
				irc.emit("message", {
					from: chan.name,
					to: irc.me,
					message: msg
				});
			});

			// When OTR lib needs to transmit something "on the wire"
			session.on('io', function(msg, meta) {
				irc.send(chan.name, msg);
			});
			this.registerSession(chan.name, network, session);
		}
	}
};

OtrStore.prototype.getSession = function(nick, network) {
	var qualifiedUser = nick + '@' + network.host;
	return this.sessions[qualifiedUser];
};

OtrStore.prototype.registerSession = function(nick, network, session) {
	var qualifiedUser = nick + '@' + network.host;
	this.sessions[qualifiedUser] = session;
};

/**
 * Is this message prefixed by an OTR header ?
 */
OtrStore.prototype.isOtrMessage = function(msg) {
	return msg.substring(0,4) === '?OTR';
};
