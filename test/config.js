var assert = require("assert");
var config = require("../src/config");

describe("config", function() {
  it("should get port", function() {
    assert(typeof config("port") === "number");
  });
});
