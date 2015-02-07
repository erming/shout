$(function() {
  init();
});

var socket = io();
var shout  = new EventEmitter;

function init() {
  gui();
}
