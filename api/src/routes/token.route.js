const Joi = require("joi");
const express = require("express");
const tokenController = require("../controllers/token.controller");
const authenticated = require("../helper/authenticated.helper");

const Router = express.Router();

// Get all tokens
Router.get("/", authenticated, async (req, res) => {
  const { error, value } = Joi.object({
    description: Joi.string().allow(''),
    page: Joi.number().allow(''),
  }).validate(req.query);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  tokenController
    .all(value.description, value.page ? (value.page - 1) * 20 : 0)
    .then((result) => {
      res.json({
        results: {
          data: result.data,
          total: result.total,
        },
        page: {
          current: value.page || 1,
          all: Math.ceil(result.total / 20),
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.post("/", authenticated, async (req, res) => {
  const { error, value } = Joi.object({
    description: Joi.string().required(),
  }).validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  tokenController
    .create(value.description)
    .then((token) => {
      res.send(token);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.delete("/:tokenId", authenticated, async (req, res) => {
  const { error, value } = Joi.object({
    tokenId: Joi.string().required(),
  }).validate(req.params);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  tokenController
    .remove(value.tokenId)
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

module.exports = Router;
