const models = require("../models");
const passwordHelper = require("../helper/password.helper");

async function create(email, password, admin) {
  const hash = await passwordHelper.hash(password);
  return new Promise((resolve, reject) => {
    let User = new models.user({
      email,
      password: hash,
      admin,
    });

    User.save()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function remove(userId) {
  return new Promise((resolve, reject) => {
    models.user
      .deleteOne({ _id: userId })
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

function validate(email, password) {
  return new Promise((resolve, reject) => {
    models.user
      .findOne({ email })
      .then((doc) => {
        if (doc) {
          passwordHelper.verify(password, doc.password).then((match) => {
            if (match) {
              resolve(doc);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function change_password(userId, password) {
  const hash = await passwordHelper.hash(password);
  return new Promise((resolve, reject) => {
    models.user
      .updateOne({ _id: userId }, { password: hash })
      .then((result) => {
        if (result.modifiedCount) {
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

async function all(email, skip) {
  return new Promise((resolve, reject) => {
    let match = {};
    if (email) {
      match = {
        email: {
          $regex: email,
          $options: "i",
        },
      };
    }

    Promise.all([
      models.user.find(match).skip(skip).limit(10),
      models.user.find(match),
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

async function update(userId, email, admin, password) {
  var hash = false;
  if (password) {
    hash = await passwordHelper.hash(password);
  }
  return new Promise((resolve, reject) => {
    let doc = { email, admin };
    if (password) {
      doc.password = hash;
    }
    models.user
      .updateOne({ _id: userId }, doc)
      .then((result) => {
        if (result.modifiedCount) {
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

module.exports = { create, remove, validate, change_password, all, update };
