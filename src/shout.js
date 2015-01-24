var http = require("http");
var express = require("express");
var io = require("socket.io");
var fs = require("fs");
var _ = require("lodash");
var config = require("./config");

module.exports = shout;

var sockets;

function shout() {
  var app = express()
    .use(serve)
    .use(express.static("client"));

  var srv = http.createServer(app);
  srv.listen(config("port"));

  sockets = io(srv)
  sockets.on("connect", function(s) {
    init(s);
  });
};

function serve(req, res, next) {
  if (req.url.split("?")[0] != "/") {
    return next();
  }
  var model = {
    shout: JSON.stringify({
      version: require("../package.json").version,
      modes: config("modes")
    })
  };
  return fs.readFile(
    "client/index.html",
    "utf-8",
    function(err, file) {
      res.end(_.template(
        file,
        model
      ));
    }
  );
}

function init(socket) {
  console.log("Client connect.");
}
