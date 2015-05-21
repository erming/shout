var _ = require("lodash");
var http = require("http");
var express = require("express");
var io = require("socket.io");
var fs = require("fs");
var bcrypt = require("bcrypt-nodejs");
var path = require("path");
var version = require("../package.json").version;
var config = require("./config");
var Manager = require("./manager");
var Client = require("./client");

module.exports = shout;

var sockets;
var manager;

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

  manager = new Manager(sockets);
  manager.load("*");

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

function init(socket, client) {
  if (!client) {
    socket.on("auth", function(data) {
      auth(socket, data);
    });
  } else {
    socket.on(
      "input",
      function(args) {
        client.input(args);
      }
    );
    socket.on(
      "conn",
      function(args) {
        client.connect(args);
      }
    );
    socket.on(
      "open",
      function(args) {
        client.open(args);
      }
    );
    socket.on(
      "sort",
      function(args) {
        client.sort(args);
      }
    );
    socket.join(client.id);
    socket.emit("init", {
      networks: client.networks
    });
  }
}

function auth(socket, data) {
  var mode = data.mode;
  if (!mode) {
    return;
  }

  switch (mode) {
  case "guest":
    var client = new Client(sockets);
    manager.clients.push(client);

    socket.on("disconnect", function() {
      manager.clients = _.without(manager.clients, client);
      client.exit();
		});

    init(socket, client);
    break;

  case "login":
    var pass = false;
    _.each(manager.clients, function(client) {
      var config = client.config;

      if (config.user == data.user) {
        if (bcrypt.compareSync(data.password || "", config.password)) {
          pass = true;
        }
      }

      if (pass) {
        init(socket, client);
        return false;
      }
    });
    break;
  }
}
