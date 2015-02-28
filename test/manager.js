var tape = require("tape");
var Client = require("../src/client");
var Manager = require("../src/manager");

tape("manager", function(t) {
  t.plan(7);

  var m = new Manager();

  var a = m.add("foo", "bar");
  var b = m.add("foo", "bar");
  var c = m.add("bar", "baz");

  var l = m.load("*");
  var f = m.find("foo");

  t.equals(a.name, "foo");
  t.equals(c.name, "bar");
  t.equals(l, 2);
  t.equals(m.clients.length, 2);
  t.equals(f.name, "foo");

  var r = m.remove("*");

  t.equals(r, 2);
  t.equals(m.clients.length, 0);

  t.end();
});
