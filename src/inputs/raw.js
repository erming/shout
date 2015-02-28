module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "raw" && cmd != "send" && cmd != "quote") {
    return;
  }

  if (args.length) {
    irc.write(args.join(" "));
  }
};
