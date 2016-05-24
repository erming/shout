var bcrypt = require("bcrypt-nodejs");

module.exports = {
	hash: hash,
	compareHash: compareHash
};

function hash(str, fn) {
	var salt = bcrypt.genSaltSync(8);
	bcrypt.hash(str, salt, null, function(err, hash) {
		fn(hash);
	});
}

function compareHash(str, hash, fn) {
	return bcrypt.compare(str, hash, function(err, match) {
		fn(match);
	});
}
