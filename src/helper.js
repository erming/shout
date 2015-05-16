var bcrypt = require("bcrypt-nodejs");

var helper = module.exports = {
  HOME: (process.env.HOME || process.env.USERPROFILE) + "/.shout",
  path: path,
  hash: hash
};

function path(file) {
  return require("path").join(helper.HOME, file);
}

function hash(str) {
  var salt = bcrypt.genSaltSync(8);
  var hash = bcrypt.hashSync(str, salt);
  return hash;
}
