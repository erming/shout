module.exports = function(key) {
  return config[key] || defaultConfig[key] || false;
};

var config;
var defaultConfig;

function load() {
  config = {};
  defaultConfig = require("../defaults/config.json");
}

load();
