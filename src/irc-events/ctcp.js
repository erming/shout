var pkg = require("../../package.json");

module.exports = function(irc, client, network) {
  irc.on("message", function(data) {
    var msg = data.message;
    if (msg.indexOf("\001") !== 0) {
      return;
    }

    var str = msg.replace(/\001/g, "");
    var split = str.split(" ");

    switch (split[0]) {
    case "VERSION":
      irc.ctcp(
        data.from,
        "VERSION " + pkg.name + " " + pkg.version
      );
      break;

    case "PING":
      if (split.length == 2) {
        irc.ctcp(
          data.from,
          "PING " + split[1]
        );
      }
      break;
    }
  });
};
