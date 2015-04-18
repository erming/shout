var _ = require("lodash");
var moment = require("moment");

module.exports = Msg;

Msg.Type = {
  ACTION: "action",
  ERROR: "error",
  JOIN: "join",
  KICK: "kick",
  MESSAGE: "message",
  MODE: "mode",
  MOTD: "motd",
  NICK: "nick",
  NOTICE: "notice",
  PART: "part",
  QUIT: "quit",
  TOGGLE: "toggle",
  TOPIC: "topic",
  WHOIS: "whois"
};

var id = 0;

function Msg(args) {
  _.merge(this, _.extend({
    id: id++,
    type: Msg.Type.MESSAGE,
    time: moment().utc().format("HH:mm:ss"),
    from: "",
    text: ""
  }, args));
}
