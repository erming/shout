module.exports = config;

function config(key) {
	return (require("../config.json") || {})[key] || false;
}
