module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;

  if (cmd !== "join") {
    return;
  }

  var args = input.args;

  if (args.length) {
    irc.join(args[0], args[1]);
  }
};
