const express = require("express");
const Joi = require("joi");
const parserController = require("../controllers/parser.controller");
const admin = require("../helper/admin.helper");
const authenticated = require("../helper/authenticated.helper");

const Router = express.Router();

Router.post("/", admin, (req, res) => {
  const { error, value } = parserSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }

  parserController.create(value).then((doc) => {
    res.json(doc);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  })
});

Router.patch("/:parserId", admin, (req, res) => {
  const { error, value } = parserSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }

  parserController.update(req.params.parserId, value).then((doc) => {
    res.json(doc);
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  })
});

const parserSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  rootPath: Joi.string().allow(''),
  unwind: Joi.string().allow(''),
  fields: Joi.object({
    ruleId: Joi.string().allow(''),
    url: Joi.string().allow(''),
    title: Joi.string().allow(''),
    message: Joi.string().allow(''),
    impact: Joi.string().allow(''),
    resource: Joi.string().allow(''),
    severity: Joi.string().allow(''),
    file: Joi.string().allow(''),
    line: Joi.string().allow(''),
    package: Joi.string().allow(''),
    version: Joi.string().allow(''),
    resolution: Joi.string().allow(''),
    cve: Joi.string().allow(''),
  }),
  severities: Joi.object({
    critical: Joi.alternatives().try(Joi.string(), Joi.number()).allow(''),
    high: Joi.alternatives().try(Joi.string(), Joi.number()).allow(''),
    medium: Joi.alternatives().try(Joi.string(), Joi.number()).allow(''),
    low: Joi.alternatives().try(Joi.string(), Joi.number()).allow(''),
    negligible: Joi.alternatives().try(Joi.string(), Joi.number()).allow(''),
  })
});

Router.get("/", authenticated,  (req, res) => {
  const { error, value } = Joi.object({
    name: Joi.string().allow(''),
    page: Joi.number().allow(''),
  }).validate(req.query);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  parserController
    .all(value.name, value.page ? (value.page - 1) * 10 : 0)
    .then((result) => {
      res.json({
        results: {
          data: result.data,
          total: result.total,
        },
        page: {
          current: value.page || 1,
          all: Math.ceil(result.total / 10),
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.get("/:parserId", admin, (req, res) => {
  parserController.get(req.params.parserId).then(doc => {
    res.send(doc)
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  })
});

Router.delete("/:parserId", admin, (req, res) => {
  parserController.remove(req.params.parserId).then(() => {
    res.send()
  }).catch((error) => {
    console.log(error);
    res.status(500).send();
  })
});

module.exports = Router;
