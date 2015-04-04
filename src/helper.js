var path = require("path");
var fs = require('fs');

module.exports = {
	HOME: (process.env.HOME || process.env.USERPROFILE) + "/.shout",
	getConfig: getConfig,
	getLines: getLines,
	countLines: countLines
};

function getConfig() {
	return require(path.resolve(this.HOME) + "/config");
};

function getLines(filename, from, to, callback) {
    var stream = fs.createReadStream(filename, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        mode: 0666,
        bufferSize: 1024
    });

    function endReached(){
        callback(null, lines.slice(0, lines.length-1));
    }

    var lines = [];
    var count = -1;
    var left = "";

    stream.on("data", function(data){
        data = (left+data).split("\n");
        if (data[data.lnegth-1]) left = data.pop();
        var next = count + data.length;
        var gtn = next >= from;
        var gtm = next >= to;
        if (gtn) lines = lines.concat(data.slice(lines.length ? 0 : from - count - 1));
        if (gtm) {
            stream.removeListener("end", endReached);
            callback(null, lines.slice(0, to - from));
        }
        count = next;
    });

    stream.on("error", function(err){
        callback(err);
    });

    stream.on("end", endReached);
}

function countLines(filename, callback) {
    var stream = fs.createReadStream(filename, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        mode: 0666,
        bufferSize: 1024
    });

    var count = -1;

    stream.on("data", function(data){
        count += data.split("\n").length;
    });

    stream.on("error", function(err){
        callback(err);
    });

    stream.on("end", function(){
        callback(null, count);
    });
}
