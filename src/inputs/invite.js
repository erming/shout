module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "invite") {
    return;
  }

  if (args.length > 1) {
    irc.invite(args[0], args[1]);
  }
};
