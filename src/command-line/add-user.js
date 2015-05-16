var program = require("commander");
var bcrypt = require("bcrypt-nodejs");
var fs = require("fs");
var mkdirp = require("mkdirp");
var Manager = require("../manager");
var helper = require("../helper");

module.exports = add;

program
  .command("add-user <name>")
  .action(add);

function add(name) {
  var path = helper.HOME + "/users";

  var manager = new Manager();
  manager.load("*");

  if (manager.find(name)) {
    console.log("");
    console.log("Error!");
    console.log("");
    console.log("User '" + name + "' already exists.");
    console.log("");
    return;
  }

  try {
    mkdirp.sync(path);
  } catch (e) {
    console.log("");
    console.log("Error!");
    console.log("");
    console.log("Could not create " + path);
    console.log("Try again as sudo.");
    console.log("");
    return;
  }

  try {
    var test = path + "/.test";
    fs.mkdirSync(test);
    fs.rmdirSync(test);
  } catch(e) {
    console.log("");
    console.log("Error!");
    console.log("");
    console.log("You have no permissions to write to " + path);
    console.log("Try again as sudo.");
    console.log("");
    return;
  }

  require("read")({
    prompt: "Password: ",
    silent: true
  }, function(err, password) {
    if (!err) {
      var hash = helper.hash(password);
      manager.add(name, hash);
      console.log("");
      console.log("Success!");
      console.log("");
      console.log("Added user '" + name + "'.");
      console.log("");
    }
  });
}
