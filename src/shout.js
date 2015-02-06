var http = require("http");
var express = require("express");
var io = require("socket.io");
var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var version = require("../package.json").version;
var config = require("./config");

module.exports = shout;

var sockets;

function shout() {
  var root = config("root");
  var app = express()
    .use(root, serve)
    .use(root, express.static("client"));

  var srv = http.createServer(app);
  srv.listen(config("port"));

  sockets = io(srv)
  sockets.on("connect", function(s) {
    init(s);
  });

  console.log("");
  console.log("shout@" + version)
  console.log("");
  console.log("Config:");
  console.log("  host  " + config("host"));
  console.log("  port  " + config("port"));
  console.log("  root  " + config("root"));
  console.log("  mode  " + _.keys(_.pick(config("mode"), function(m) { return m; })).join(", "));
  console.log("");
  console.log("Server started!");
  console.log("Press ctrl-c to stop");
  console.log("");
};

function serve(req, res, next) {
  if (req.url.split("?")[0] != "/") {
    return next();
  }

  var model = {
    shout: JSON.stringify({
      version: require("../package.json").version,
      mode: config("mode")
    }),
    path: function(file) {
      return path.resolve(
        config("root"),
        file
      );
    },
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
