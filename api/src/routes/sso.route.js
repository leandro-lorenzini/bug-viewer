const express = require("express");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const settingsController = require("../controllers/settings.controller");

const Router = express.Router();

// Loads strategy from database (Organization collection)
Router.use(async (req, res, next) => {
  try {
    // Fetch the strategy config from the database
    let organization = await settingsController.get();

    if (!organization.sso.enabled) {
      throw new Error("No SAML strategy config found");
    }

    // Configure the SAML strategy
    const samlStrategy = new SamlStrategy(
      {
        path: `/auth/sso/callback`,
        entryPoint: organization.sso.entryPoint,
        issuer: organization.sso.issuer,
        cert: organization.sso.certificate,
      },
      (profile, done) => done(null, profile)
    );

    // Register the strategy
    passport.use("saml", samlStrategy);

    // Continue to the next middleware
    next();
  } catch (err) {
    // If something went wrong, send an error response
    res.status(500).json({ error: err.message });
  }
});

/* 
  Redirects the user to the identity provider.
  Token previously created is sent to the idp as RelayState
*/
Router.get("/", (req, res, next) => {
  passport.authenticate("saml", {
    failureRedirect: "/api/auth/sso/fail",
  })(req, res, next);
});

/* 
  Callback URL
  The Identity provider will call this url with the authentication result.
  It also returns the RelayState so that we can update the authenticationtoken status.
*/
Router.post(
  "/callback",
  passport.authenticate("saml", {
    failureRedirect: "/api/auth/sso/fail/",
    session: false,
  }),
  async (req, res) => {
    let groups = req.user.memberOf;
    if (groups && !Array.isArray(groups)) {
      groups = [groups];
    }

    let organization = await settingsController.get();
    console.log(req.user);

    req.session.userId = req.user.nameID;
    req.session.admin = groups?.includes(organization.sso.adminGroup);

    req.session.save(() => {
      console.log(req.session);
      res.redirect("/");
    });
  }
);

Router.get("/info", (req, res) => {
  res.send(req.session);
});

Router.get("/fail", (req, res) => {
  res.send("An error has happened while signing you in!");
});

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = Router;
