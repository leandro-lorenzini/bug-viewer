module.exports = function admin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.status(403).send();
  }
};
