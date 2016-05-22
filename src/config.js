module.exports = function(key) {
	return (require("../config.json") || {})[key] || false;
};
