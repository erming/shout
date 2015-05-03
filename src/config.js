var fs = require("fs");
var helper = require("./helper");

module.exports = config;

var configObject;
function config(key) {
  return (configObject || {})[key] || false;
}

config.exists = exists;
config.getPath = getPath;

function exists() {
  return typeof configObject !== "undefined";
}

function getPath() {
  return helper.path("/config.json");
}

function load() {
  try {
    configObject = require(getPath());
  } catch(e) {
    // ..
  }
}

load();
