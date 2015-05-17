function gui() {
  var mode = shout.mode;
  if (mode.guest && mode.login) {
    start();
  } else if (mode.login) {
    login();
  } else {
    connect();
  }
}

function start() {
  var main = $("#main");
  var html = render("start");
  main.append(html);

  var start = $("#start");

  start.find(".guest").one("click", function() {
    connect();
    start.remove();
  });

  start.find(".login").one("click", function() {
    login();
    start.remove();
  });
}

function login() {
  var main = $("#main");
  var html = render("login");
  main.append(html);
}

function connect() {
  var main = $("#main");
  var html = render("connect");
  main.append(html);
}
