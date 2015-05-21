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
  $("#sidebar")
    .html(render("sidebar"))
    .find(".login")
    .on("click", function() {
      login();
    })
    .end()
    .find(".connect")
    .on("click", function() {
      connect();
    });
}

function start() {
  $("#main")
    .html(render("start"))
    .find("#start")
    .find(".guest, .login")
    .on("click", function(e) {
      $(this).unbind("click");
      $("#start").remove();
      if ($(e.target).hasClass("guest")) {
        socket.emit("auth", {
          mode: "guest"
        });
      } else {
        login();
      }
    });
}

function login() {
  $("#main")
    .html(render("login"))
    .find("#login")
    .find(".username")
    .focus()
    .end()
    .find("form")
    .on("submit", function(e) {
      e.preventDefault();
      var form = $(this);
      var user = form.find(".username").val();
      var password = form.find(".password").val();
      form.find("input").blur();
      socket.emit("auth", {
        mode: "login",
        user: user,
        password: password
      });
    });
}

function connect() {
  $("#main")
    .html(render("connect"))
    .find("#connect")
    .on("submit", function(e) {
      e.preventDefault();
      var form = $(this);
      var values = {};
      $.each(form.serializeArray(), function(i, obj) {
        if (obj.value !== "") {
          values[obj.name] = obj.value;
        }
      });
      socket.emit(
        "conn", values
      );
    }).on("input", ".nick", function() {
      var nick = $(this).val();
      $("#connect").find(".username").val(nick);
    });
}
