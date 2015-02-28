module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "whois") {
    return;
  }

  if (args.length) {
    irc.whois(args[0]);
  }
};
