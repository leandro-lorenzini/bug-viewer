const models = require("../models");
const userController = require("../controllers/user.controller");
const fs = require("fs");

function get() {
  return new Promise((resolve, reject) => {
    models.settings
      .findOne()
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setup() {
  return new Promise((resolve, reject) => {
    get()
      .then(async (settings) => {
        if (settings) {
          resolve(settings);
        } else {
          let Settings = new models.settings({ sso: { enabled: false } });
          try {
            Settings.save();
            userController.create("admin@localhost", "admin@localhost", true);
            console.log(
              "Default user has been created, make sure to delete the default user after setting up your account."
            );
            console.log("Default credentials: admin@localhost/admin@localhost");

            // Create default parsers
            let parsers = fs.readFileSync("./starter/parsers.json", "utf-8");
            models.parser.insertMany(JSON.parse(parsers));

            resolve();
          } catch (error) {
            reject(error);
          }
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setSSO(enabled, entryPoint, certificate, issuer, adminGroup) {
  return new Promise((resolve, reject) => {
    models.settings
      .updateOne(
        { default: true },
        { sso: { enabled, entryPoint, certificate, issuer, adminGroup } }
      )
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

module.exports = { setup, setSSO, get };
