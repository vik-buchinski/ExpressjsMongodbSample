var Express = require('express');
var Router = Express.Router();
var JWT = require('jsonwebtoken');
var Constants = require('../utils/constants');

var User = require('../models/user');
var Session = require('../models/session');

Router.post('/register', function (req, res, next) {
  User.create(req.body, function (err, user) {
    if (err) return next(err);

    // if user is found and password is right
    // create a token
    var token = JWT.sign(user, Constants.WEB_TOKEN_SECRET, {
      expiresIn: Constants.TOKEN_EXPIRATION_TIME,
    });

    var session = new Session({
      [Constants.MODELS_KEYS.SESSION.USER_ID]: user.id,
      [Constants.MODELS_KEYS.SESSION.TOKEN]: token,
    });

    session.save(function (err, sessionModel) {
      if (err) return next(err);

      res.json(sessionModel);
    });
  });
});

Router.post('/authentication', function (req, res, next) {
  var validationErr = new Error('Invalid email or password');
  validationErr.status = 403;
  if(!req.body[Constants.MODELS_KEYS.USER.EMAIL] || !req.body[Constants.MODELS_KEYS.USER.PASSWORD]) {
    return next(validationErr);
  }

  User.findOne({
    [Constants.MODELS_KEYS.USER.EMAIL]: req.body[Constants.MODELS_KEYS.USER.EMAIL],
  }).exec(function (err, user) {
    if (err) return next(err);
    if(!user) return next(validationErr);

    var isAuthenticated = user.authenticate(req.body[Constants.MODELS_KEYS.USER.PASSWORD]);
    if(!isAuthenticated) return next(validationErr);
    Session.findOne({
      [Constants.MODELS_KEYS.SESSION.USER_ID]: user.id,
      [Constants.MODELS_KEYS.SESSION.IS_ACTIVE]: true,
    }).exec(function (err, session) {
      if (err) return next(err);

      var createSession = function() {
        var token = JWT.sign(user, Constants.WEB_TOKEN_SECRET, {
          expiresIn: Constants.TOKEN_EXPIRATION_TIME,
        });

        var sessionModel = new Session({
          [Constants.MODELS_KEYS.SESSION.USER_ID]: user.id,
          [Constants.MODELS_KEYS.SESSION.TOKEN]: token,
        });

        sessionModel.save(function (err, savedSession) {
          if (err) return next(err);

          res.json(savedSession);
        });
      };

      if (session) {
        try {
          //token is not expired
          var decoded = JWT.verify(session[Constants.MODELS_KEYS.SESSION.TOKEN], Constants.WEB_TOKEN_SECRET);
          res.json(session);
        } catch (err) {
          //token is expired or wrong
          session[Constants.MODELS_KEYS.SESSION.IS_ACTIVE] = false;
          session.save(function (err, savedSession) {
            if (err) return next(err);
            createSession();
          });
        }
      } else {
        createSession();
      }
    });
  });
});

module.exports = Router;
