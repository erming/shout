module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "part" && cmd != "leave" && cmd != "close") {
    return;
  }

  if (!args.length) {
    args.push(target.chan);
  }

  irc.part(args);
};
