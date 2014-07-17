/* jshint node:true, camelcase: true */
"use strict";

/**
 * Module dependencies
 */
// 3rd-party
var Promise = require("bluebird");
var stripJsonComments = require("strip-json-comments");

// node.js
var fs = Promise.promisifyAll(require("fs"));

// retrieve, clean, and load config.json
// TODO: expose path setting for config.json
fs.readFileAsync("./config.json", "utf8")
    .then(stripJsonComments)
    .then(JSON.parse)
    .then(function(config) {

        var shout = require("./lib/server");
        shout(config);
    })
    .catch(function(e) {
        console.log(e);
    });



