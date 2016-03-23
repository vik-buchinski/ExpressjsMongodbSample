var JWT = require('jsonwebtoken');
var Constants = require('./constants');

var Session = require('../models/session');

module.exports = {
  getErrJson: function (err, app) {
    if (app && app.get('env') === 'development') {
      // development error handler
      return {
        message: err.message,
        error: err,
      };
    } else {
      // production error handler
      // no stacktraces leaked to user
      return {
        message: err.message,
      };
    }
  },

  isEmailValid: function (email) {
    return email.match(/\S+@\S+\.\S+/);
  },

  /**
  * checkSessionToken - check if session token is valid.
  * callback - return nothing if valid, or err.
  */
  checkSessionToken: function(token, callback) {
    if(!token) {
      var err = new Error('\'' + Constants.SESSION_TOKEN_KEY + '\' is required');
      err.status = 401;
      callback(err);
      return;
    }

    try {
      //token is not expired
      var decoded = JWT.verify(token, Constants.WEB_TOKEN_SECRET);
      callback(null);
    } catch (e) {
      var getErr = function() {
        var err = new Error('Invalid or expired token');
        err.status = 401;
        return err;
      };

      if(e.name === 'TokenExpiredError') {
        // make it expired in database
        Session.findOne({
          [Constants.MODELS_KEYS.SESSION.TOKEN]: token,
          [Constants.MODELS_KEYS.SESSION.IS_ACTIVE]: true,
        }).exec(function (err, session) {
          if(session) {
            session[Constants.MODELS_KEYS.SESSION.IS_ACTIVE] = false;
            session.save(function (err, savedSession) {
              if (err) callback(err);
              callback(getErr());
            });
          } else {
            callback(getErr());
          }
        });
      } else {
        callback(getErr());
      }
    }
  },
};
