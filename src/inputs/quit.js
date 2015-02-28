module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "quit" && cmd != "disconnect") {
    return;
  }

  var msg = args.join(" ");
  var network = target.network;

  irc.quit(msg);
  client.quit(network);
};
