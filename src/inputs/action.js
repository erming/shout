module.exports = function(irc, client, target, input) {
  var cmd = input.cmd;
  var args = input.args;

  if (cmd != "slap" && cmd != "me" && cmd != "action") {
    return;
  }

  var slap;
  if (cmd == "slap") {
    slap = "slaps " + args[0] + " around a bit with a large trout";
  }

  var text = slap || args.join(" ");
  var chan = target.chan;

  if (args.length) {
    irc.action(chan.name, text);
  }
};
