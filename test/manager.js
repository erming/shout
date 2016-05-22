var tape = require("tape");
var Client = require("../src/client");
var Manager = require("../src/manager");

tape("manager", function(t) {
	t.plan(8);

	var m = new Manager();

	var a = m.create("foo", "bar");
	var b = m.create("foo", "bar");
	var c = m.create("bar", "baz");

	var l = m.load("*");
	var f = m.find("foo");

	t.assert(l >= 2);
	t.assert(m.list().length >= 2);

	t.equals(a.user, "foo");
	t.equals(c.user, "bar");
	t.equals(f.name, "foo");

	var rf = m.remove("foo");
	var rb = m.remove("bar");

	t.equals(rf, 1);
	t.equals(rb, 1);

	t.notEqual(l, m.clients.length);

	t.end();
});
