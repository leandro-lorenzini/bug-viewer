const Joi = require("joi");
const express = require("express");
const userController = require("../controllers/user.controller");
const admin = require("../helper/admin.helper");

const Router = express.Router();

Router.post("/", admin, async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    admin: Joi.boolean().required(),
  }).validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  userController
    .create(value.email, value.password, value.admin)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});
Router.delete("/:userId", admin, (req, res) => {
  const { error, value } = Joi.object({
    userId: Joi.string().required(),
  }).validate(req.params);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  userController
    .remove(value.userId)
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.patch("/:userId", admin, async (req, res) => {
  const { error, value } = Joi.object({
    userId: Joi.string().required(),
    email: Joi.string().required(),
    admin: Joi.boolean().required(),
    password: Joi.string().allow('')
  }).validate({...req.body, ...req.params});

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  userController
    .update(
      value.userId,
      value.email,
      value.admin,
      value.password
    )
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

Router.get("/", admin, async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().allow(''),
    page: Joi.string()
  }).validate(req.query);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  
  userController
    .all(value.email, value.page ? (value.page - 1) * 10 : 0)
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

module.exports = Router;
