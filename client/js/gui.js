function gui() {
  sidebar();

  var mode = shout.mode;
  if (mode.guest && mode.login) {
    start();
  } else if (mode.login) {
    login();
  } else {
    connect();
  }
}

function sidebar() {
  var sidebar = $("#sidebar").html(render("sidebar"));
  var actions = $("#actions");

  actions.find(".connect").on("click", function() {
    connect();
  });
}

function start() {
  var main = $("#main").html(render("start"));
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
  var main = $("#main").html(render("login"));
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

function connect() {
  var main = $("#main").html(render("connect"));
  var form = $("#connect");

  form.on("submit", function(e) {
    e.preventDefault();

    var values = {};
		$.each(form.serializeArray(), function(i, obj) {
			if (obj.value !== "") {
				values[obj.name] = obj.value;
			}
		});

    socket.emit(
      "conn", values
    );
  });

  form.on("input", ".nick", function() {
    var nick = $(this).val();
    form.find(".username").val(nick);
  });
}
