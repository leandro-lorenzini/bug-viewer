const models = require("../models");
const crypto = require("crypto");

async function create(description) {
  return new Promise((resolve, reject) => {
    let Token = new models.token({
      token: crypto.randomBytes(32).toString("hex"),
      description,
    });

    Token.save()
      .then(() => {
        resolve(Token);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function remove(tokenId) {
  return new Promise((resolve, reject) => {
    models.token
      .deleteOne({ _id: tokenId })
      .then((result) => {
        if (result.deletedCount) {
          resolve();
        } else {
          reject();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function all(description, skip) {
  return new Promise((resolve, reject) => {
    let match = {};
    if (description) {
      match = {
        description: {
          $regex: description,
          $options: "i",
        },
      };
    }

    Promise.all([
      models.token.find(match).skip(skip).limit(10),
      models.token.find(match),
    ])
      .then((values) => {
        resolve({
          data: values[0],
          total: values[1].length,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function get(token) {
  return new Promise((resolve, reject) => {
    models.token
      .findOne({ token })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = { create, remove, get, all };
