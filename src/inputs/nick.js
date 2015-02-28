module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "nick") {
    return
  }

  if (args.length) {
    irc.nick(args[0]);
  }
};
