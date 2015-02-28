var tape = require("tape");
var Client = require("../src/client");

tape("client", function(t) {
  var c = new Client();
  t.end();
});
