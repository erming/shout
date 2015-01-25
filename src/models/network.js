var _ = require("lodash");

module.exports = Network;

var id = 0;

function Network(args) {
  _.merge(this, _.extend({
    id: id++,
    irc: null,
    name: "",
    host: "",
    port: 6667,
    tls: false,
    channels: [],
    password: "",
    username: "",
    realname: ""
  }, args));
}
