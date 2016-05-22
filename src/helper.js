var bcrypt = require("bcrypt-nodejs");

module.exports = {
	hash: hash,
	compareHash: compareHash
};

function hash(str) {
	var salt = bcrypt.genSaltSync(8);
	var hash = bcrypt.hashSync(str, salt);
	return hash;
}

function compareHash(str, hash) {
	return bcrypt.compareSync(str, hash);
}
