var _ = require("lodash");
var glob = require("glob");
var fs = require("fs");
var mkdirp = require("mkdirp");
var Client = require("./client");
var helper = require("./helper");

module.exports = Manager;

function Manager(sockets) {
  this.clients = [];
  this.sockets = sockets;
}

Manager.prototype = {
  load: load,
  find: find,
  list: list,
  create: create,
  remove: remove,
};

function load(pattern) {
  var c = 0;

  var path = helper.path("users/" + pattern);
  var files = glob.sync(path);

  var self = this;

  files.forEach(function(f) {
    try {
      var text = fs.readFileSync(f, "utf-8");
      var json = JSON.parse(text);
    } catch(err) {
      return;
    }

    var name = json.user;
    if (!name || find(name)) {
      return;
    }

    self.clients.push(new Client(
      self.sockets,
      name,
      json
    ));

    c++;
  });

  return c;
}

function find(name) {
  var c = this.clients;
  for (var i in c) {
    if (c[i].name == name) {
      return c[i];
    }
  }
}

function list() {
  var names = [];
  var c = this.clients;
  for (var i in c) {
    names.push(c[i].name);
  }
  return names;
}

function create(name, password) {
  if (find(name)) {
    return;
  }

  var path = helper.path("users/");
  var user = _.clone(require("../defaults/user.json"));

  user.user = name;
  user.password = password;

  mkdirp(path);

  var json = JSON.stringify(user, null, "  ");
  var opts = {mode: "0777"};

  try {
    fs.writeFileSync(
      path + name + ".json",
      json,
      opts
    );
  } catch(err) {
    return;
  }

  return user;
}

function remove(pattern) {
  var c = 0;

  if (pattern.split(".").pop() != "json") {
    pattern += ".json";
  }

  var path = helper.path("users/" + pattern);
  var files = glob.sync(path);

  var self = this;

  files.forEach(function(f) {
    try {
      fs.unlinkSync(f);
    } catch(err) {
      return;
    }

    var name = require("path").basename(f, ".json");
    var user = self.find(name);

    if (user) {
      self.clients = _.without(
        self.clients,
        user
      );
    }

    c++;
  });

  return c;
}
