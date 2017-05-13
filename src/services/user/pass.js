/**
 * Module dependencies.
 */
const crypto = require('crypto');

/**
 * Bytesize.
 */
var len = 64;

/**
 * Iterations. ~300ms
 */
var iterations = 12000;

/**
 * Digest
 */
const digest = 'sha512';

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 */
export default (password, salt) => {
        return crypto.pbkdf2Sync(password, salt, iterations, len,digest).toString('base64')
};
