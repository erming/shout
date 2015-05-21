var _ = require("lodash");
var crypto = require("crypto");
var net = require("net");
var tls = require("tls");
var events = require("./irc-events");
var Network = require("./models/network");

module.exports = Client;

var id = 0;

function Client(sockets, name, config) {
  _.merge(this, {
    chan: -1,
    config: config,
    id: id++,
    name: name,
    networks: [],
    sockets: sockets,
    token: crypto.randomBytes(48)
  });
}

Client.prototype = {
  emit: emit,
  input: input,
  connect: connect,
  open: open,
  quit: quit,
  exit: exit,
  sort: sort,
  save: save
};

function emit(e, data) {
  if (this.sockets) {
    this.sockets.in(this.id).emit(e, data);
  }
}

function input() {}

function connect(args) {
  var client = this;
  var server = {
    name: args.name || "",
    host: args.host || "",
    port: args.port || (args.tls ? 6697 : 6667)
  };

  if (!server.host) {
    return;
  }

  if (args.tls) {
    server.socket = net.connect(server);
  }

  var stream = args.tls ? tls.connect(server) : net.connect(server);

  stream.on("error", function(e) {
    stream.end();
    var msg = new Msg({
      type: Msg.Type.ERROR,
      text: "The connection has been closed due to an error."
    });
    this.emit("msg", {
      msg: msg
    });
  });

  var nick = args.nick || "shout-user";
  var username = (args.username || nick).replace(/[^a-zA-Z0-9]/g, "");
  var realname = (args.realname || "Shout User");

  var irc = require("slate-irc")(stream);

  if (args.password) {
    irc.pass(args.password);
  }

  irc.me = nick;
  irc.nick(nick);
  irc.user(username, realname);

  var network = new Network({
    irc: irc,
    name: server.name,
    host: server.host,
    port: server.port,
    tls: !!args.tls,
    password: args.password,
    username: username,
    realname: realname
  });

  this.networks.push(network);
  this.emit("network", {
    network: network
  });

  events.forEach(
    function(event) {
      event(irc, client, network);
    }
  );

  irc.once("welcome", function() {
    setTimeout(function() {
      irc.write("PING " + network.host);
    }, 1000);
  });

  irc.once("pong", function() {
    if (args.join) {
      var channels = args.join.replace(/\,/g, " ").split(/\s+/g);
      irc.join(channels);
    }
  });
}

function open(id) {}
function quit(network) {}
function exit() {}
function sort() {}
function save() {}
