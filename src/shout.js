var express = require("express");
var config = require("./config");

module.exports = function() {
  var app = express()
    .use(express.static("client"))
    .listen(config("port"));
};
