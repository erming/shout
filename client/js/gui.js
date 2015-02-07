function gui() {
  var body = $("body");
  $(".lt, #shade").on("touchstart click", function() {
    body.toggleClass("lt");
  });
}
