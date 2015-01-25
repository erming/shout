var _ = require("lodash");

module.exports = User;

function User(args) {
  _.merge(this, _.extend({
    mode: "",
    name: ""
  }, args));
}
