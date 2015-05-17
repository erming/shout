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
  main.html(html);

  var start = $("#start");

  start.find(".guest, .login").one("click", function(e) {
    if ($(e.target).hasClass("guest")) {
      socket.emit("auth", {mode: "guest"});
    } else {
      login();
    }
    start.remove();
  });
}

function login() {
  var main = $("#main");
  var html = render("login");
  main.html(html);

  var login = $("#login");

  login.find(".username").focus();
  login.find("form").on("submit", function(e) {
    e.preventDefault();
    var form = $(this);

    var user = form.find(".username").val();
    var password = form.find(".password").val();

    socket.emit("auth", {
      mode: "login",
      user: user,
      password: password
    });

    form.find("input").blur();
  });
}

function loginAsGuest() {

}

function connect() {
  var main = $("#main");
  var html = render("connect");
  main.html(html);
}
