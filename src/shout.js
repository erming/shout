var express = require("express");

module.exports = function() {
	var app = express()
		.use(express.static("client"))
		.listen(8080);
};
