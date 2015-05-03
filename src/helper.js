var helper = {
  HOME: (process.env.HOME || process.env.USERPROFILE) + "/.shout",
  path: path
};

module.exports = helper;

function path(file) {
  return require("path").join(helper.HOME, file);
}
