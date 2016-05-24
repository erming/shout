var _ = require("lodash");

module.exports = Manager;

function Manager() {
	_.merge(this, {
		clients: []
	});
}

Manager.prototype = {
	login: login
};

function login(sockets, data) {
	console.log(data);
}