const models = require("../models");

function get(name) {
  return new Promise((resolve, reject) => {
    models.parser
      .findOne({ name })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function all(name, skip) {
  return new Promise((resolve, reject) => {
    let match = {};
    if (name) {
      match = {
        name: {
          $regex: name,
          $options: "i",
        },
      };
    }

    Promise.all([
      models.parser.find(match).skip(skip).limit(20),
      models.parser.find(match)
    ]).then(values => {
      resolve({
        data: values[0],
        total: values[1].length,
      });
    }).catch((error) => {
      reject(error);
    });

  });
}

function create(doc) {
  return new Promise((resolve, reject) => {
    let parser = new models.parser(doc);
    parser.save().then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function update(_id, doc) {
  return new Promise((resolve, reject) => {
    models.parser
      .updateOne({ _id }, doc)
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

function remove(_id) {
  return new Promise((resolve, reject) => {
    models.parser.deleteOne({ _id })
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

module.exports = { all, create, update, get, remove };
