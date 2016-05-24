var _ = require("lodash");
var Network = require("./models/network");

module.exports = Client;

var id = 0;

function Client(sockets, type, name) {
	_.merge(this, {
		sockets: sockets,
		id: id++,
		name: name,
		networks: [],
	});
}

Client.prototype = {
	emit: emit
};

function emit(e, data) {
	if (this.sockets) {
		this.sockets.in(this.id).emit(e, data);
	}
}
