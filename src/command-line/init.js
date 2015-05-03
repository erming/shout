var program = require("commander");
var fs = require("fs");
var mkdirp = require("mkdirp");
var config = require("../config");
var helper = require("../helper");

module.exports = init;

program
  .command("init")
  .action(init);

function init() {
  if (config.exists()) {
    console.log("");
    console.log("Can't do that!");
    console.log("Config already exists at " + config.getPath());
    console.log("");
  } else {
    mkdirp.sync(helper.HOME);
    fs.writeFileSync(
      config.getPath(),
      fs.readFileSync("defaults/config.json")
    );
    console.log("");
    console.log("Config created at " + config.getPath());
    console.log("");
  }
}
