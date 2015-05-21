var fs = require("fs");
var mkdirp = require("mkdirp");
var helper = require("./helper");

module.exports = config;

var configObject;
function config(key) {
  return (configObject || {})[key] || false;
}

config.exists = exists;
config.reset = reset;
config.getPath = getPath;

function exists() {
  return typeof configObject !== "undefined";
}

function reset() {
  try {
    mkdirp.sync(helper.HOME);
    fs.writeFileSync(
      getPath(),
      fs.readFileSync("defaults/config.json")
    );
    return true;
  } catch(e) {
    return false;
  }
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
