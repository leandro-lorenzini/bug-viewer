const express = require("express");
const Joi = require("joi");
const settingsController = require("../controllers/settings.controller");
const admin = require("../helper/admin.helper");
const authenticated = require("../helper/authenticated.helper");
var pjson = require('../../package.json');

const Router = express.Router();

Router.get("/version", authenticated, (req, res) => {
  res.send(pjson.version);
});

// Get settings
Router.get("/", admin, async (req, res) => {
  settingsController
    .get()
    .then((settings) => {
      res.send(settings);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// Set SSO settings
Router.post("/sso", admin, async (req, res) => {
  const { error, value } = Joi.object({
    enabled: Joi.boolean().required(),
    entryPoint: Joi.string().allow(''),
    certificate: Joi.string().allow(''),
    issuer: Joi.string().allow(''),
    adminGroup: Joi.string().allow(''),
  }).validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  settingsController
    .setSSO(
      value.enabled,
      value.entryPoint,
      value.certificate,
      value.issuer,
      value.adminGroup
    )
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

module.exports = Router;
