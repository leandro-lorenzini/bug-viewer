module.exports = function authenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(403).send();
  }
};
