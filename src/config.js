var fs = require("fs");
var configObject;

module.exports = config;
module.exports.exists = exists;

function config(key) {
  return (configObject || {})[key] || false;
};

function exists() {
  return typeof configObject !== undefined;
}

function load() {
  try {
    configObject = require("../defaults/config.json");
  } catch(e) {
    // ..
  }
}

load();
