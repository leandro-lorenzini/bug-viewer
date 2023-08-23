const express = require("express");
const Joi = require("joi");
const userController = require("../controllers/user.controller");
const settingsController = require("../controllers/settings.controller");
const authenticated = require("../helper/authenticated.helper");
const Router = express.Router();

// Check if SSO is enabled
Router.get("/options", async (req, res) => {
  settingsController
    .get()
    .then((settings) => {
      res.send({ sso: settings?.sso?.enabled || false });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// Local database Login
Router.post("/", async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (error) {
    return res.status(400).json(error.details);
  }

  userController
    .validate(value.email, value.password)
    .then((user) => {
      if (user) {
        req.session.userId = user._id;
        req.session.admin = user.admin;
        req.session.save(() => {
          res.send(req.session);
        });
      } else {
        res.status(401).send();
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// Delete an active session
Router.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Change password of authenticated user
Router.post("/change-password", authenticated, async (req, res) => {
  const { error, value } = Joi.object({
    password: Joi.string().required(),
  }).validate(req.body);

  if (error) {
    return res.status(400).json(error.details);
  }

  userController
    .change_password(req.session.userId, value.password)
    .then(() => {
      res.send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// Return current session
Router.get("/", (req, res) => {
  res.json(req.session);
});

Router.use("/sso", require("./sso.route"));

module.exports = Router;
