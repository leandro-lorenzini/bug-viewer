/**
 * Used by the authentication router
 */

const crypto = require("crypto");
/**
 * Hash a string
 * @param {string} password
 * @returns {Promise}
 */
function hash(password) {
  return new Promise((resolve, reject) => {
    if (!password) {
      return reject(new Error("Password is required"));
    }

    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}
/**
 * Verify if a hash matches a string
 * @param {String} password
 * @param {String} hash
 * @returns {Promise}
 */
function verify(password, hash) {
  return new Promise((resolve, reject) => {
    if (!password || !hash) {
      return reject("Password and hash are required");
    }

    const [salt, key] = hash.split(":");

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }

      const derivedKeyHex = derivedKey.toString("hex");
      let bufferA = Buffer.from(key, "hex");
      let bufferB = Buffer.from(derivedKeyHex, "hex");

      // Handle length inconsistencies by padding the shorter buffer
      let diff = Math.abs(bufferA.length - bufferB.length);
      const padding = Buffer.alloc(diff, 0);
      if (bufferA.length < bufferB.length)
        bufferA = Buffer.concat([bufferA, padding]);
      else bufferB = Buffer.concat([bufferB, padding]);

      resolve(crypto.timingSafeEqual(bufferA, bufferB));
    });
  });
}

module.exports = { hash, verify };
