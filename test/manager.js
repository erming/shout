var tape = require("tape");
var Client = require("../src/client");
var Manager = require("../src/manager");

tape("manager", function(t) {
  t.plan(8);

  var m = new Manager();

  var a = m.add("foo", "bar");
  var b = m.add("foo", "bar");
  var c = m.add("bar", "baz");

  var l = m.load("*");
  var f = m.find("foo");

  t.assert(l >= 2);
  t.assert(m.list().length >= 2);

  t.equals(a.name, "foo");
  t.equals(c.name, "bar");
  t.equals(f.name, "foo");

  var rf = m.remove("foo");
  var rb = m.remove("bar");

  t.equals(rf, 1);
  t.equals(rb, 1);

  t.notEqual(l, m.clients.length);

  t.end();
});
