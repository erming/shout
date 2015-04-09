module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if ((cmd != "say" && cmd != "msg") || (!args.length || !args[0])) {
    return;
  }

  var to = "";
  if (cmd == "msg") {
    to = args.shift();
    if (!args.length) {
      return;
    }
  }

  if (!to) {
    to = target.chan;
  }

  var msg = args.join(" ");
  irc.send(
    to,
    msg
  );
};
