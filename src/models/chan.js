var util = require("util");
var _ = require("lodash");
var Helper = require("../helper");

module.exports = Chan;

Chan.Type = {
	CHANNEL: "channel",
	LOBBY: "lobby",
	QUERY: "query"
};

var MessageArray = function(chan){
    Array.call(this);
    this.chan = chan;
    this.log = Helper.HOME + "/logs/" + this.chan.user 
        + "/" + this.chan.network + "/" + this.chan.channel + ".log";
    var that = this;
    Helper.countLines(this.log, function(err, count){
        that.count = err ? 0 : count;
    });
};
util.inherits(MessageArray, Array);

MessageArray.prototype.push = function(message) {
    var config = Helper.getConfig();
    if (config.log === true) {
        if (this.length > 250) this.splice(50);
    }
    Array.prototype.push.call(this, message);
    this.count++;
};

MessageArray.prototype.fetch = function(from, to, callback) {
    var messages = [];
    if (from < this.length) messages = messages.concat(this.slice(from));
    if (to <= this.length) callback(null, messages.slice(0, to));
    else if (this.log) {
        var linesFrom = from + messages.length;
        Helper.getLines(this.log, linesFrom, to, function(err, lines){
            callback(null, messages.concat(lines)); 
        });
    }
    else callback(null, messages);
};

var id = 0;

function Chan(attr) {
	_.merge(this, _.extend({
		id: id++,
		name: "",
		topic: "",
		type: Chan.Type.CHANNEL,
		unread: 0,
		users: []
	}, attr));
	this.messages = new MessageArray(this);
}

Chan.prototype.sortUsers = function() {
	this.users = _.sortBy(
		this.users,
		function(u) { return u.name.toLowerCase(); }
	);
	var modes = [
		"~",
		"&",
		"@",
		"%",
		"+",
	].reverse();
	modes.forEach(function(mode) {
		this.users = _.remove(
			this.users,
			function(u) { return u.mode == mode; }
		).concat(this.users);
	}, this);
};

Chan.prototype.getMode = function(name) {
	var user = _.find(this.users, {name: name});
	if (user) {
		return user.mode;
	} else {
		return "";
	}
};

Chan.prototype.toJSON = function() {
	var clone = _.clone(this);
	clone.messages = clone.messages.slice(-100);
	return clone;
};
