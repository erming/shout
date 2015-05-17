$(function() {
  load();
});

var socket = io();
var events = new EventEmitter;

function load() {
  gui();
  socket.on("init", init);
}

function init(data) {
  console.log("'init' sent by server");
}
