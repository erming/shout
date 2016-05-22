var _ = require("lodash");

module.exports = Chan;

Chan.Type = {
	CHANNEL: "channel",
	LOBBY: "lobby",
	QUERY: "query"
};

var id = 0;

function Chan(args) {
	_.merge(this, _.extend({
		id: id++,
		messages: [],
		users: [],
		type: Chan.Type.CHANNEL,
		name: ""
	}, args));
}
