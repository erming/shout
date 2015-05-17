$(function() {
  init();
});

var socket = io();
var events = new EventEmitter;

function init() {
  gui();
}
