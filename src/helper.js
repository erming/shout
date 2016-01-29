var path = require("path");

module.exports = {
	HOME: (process.env.SHOUT_HOME ? process.env.SHOUT_HOME : (process.env.HOME || process.env.USERPROFILE) + "/.shout"),
	getConfig: getConfig
};

function getConfig() {
	return require(path.resolve(this.HOME) + "/config");
}
