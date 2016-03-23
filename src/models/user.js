var Mongoose = require('mongoose');
var Constants = require('../utils/constants');
var Common = require('../utils/common');

var PasswordHash = require('password-hash');

var ModelSchema = new Mongoose.Schema({
  [Constants.MODELS_KEYS.USER.EMAIL]: { type: String, default: '' },
  [Constants.MODELS_KEYS.USER.PASSWORD_HASH]: { type: String, default: '' },
}, {
  versionKey: false, // for removing '_v' from database model
  timestamps: {
    createdAt: Constants.MODELS_KEYS.COMMON.CREATED_AT,
    updatedAt: Constants.MODELS_KEYS.COMMON.UPDATED_AT,
  },
});

ModelSchema
.virtual(Constants.MODELS_KEYS.USER.PASSWORD)
.set(function (password) {
  this._password = password;
  this[Constants.MODELS_KEYS.USER.PASSWORD_HASH] = PasswordHash.generate(password);
})
.get(function () {
  return this._password;
});

// Duplicate the ID field.
ModelSchema.virtual('id').get(function () {
  return this._id;
});

// Model validations
ModelSchema.path(Constants.MODELS_KEYS.USER.EMAIL).validate(function (field, fn) {
  const User = Mongoose.model(Constants.MODELS_NAMES.USER);

  // Check only when it is a new user
  if (this.isNew) {
    User.find({ [Constants.MODELS_KEYS.USER.EMAIL]: field }).exec(function (err, users) {
      fn(!err && users.length === 0);
    });
  } else {
    fn(true);
  };
}, 'Such user already exist');

ModelSchema.path(Constants.MODELS_KEYS.USER.EMAIL).validate(function (field, fn) {
  if (field) {
    Common.isEmailValid(field) ? fn(true) : fn(false);
  } else {
    fn(true);
  };
}, 'Invalid email format');

ModelSchema.path(Constants.MODELS_KEYS.USER.EMAIL).validate(function (field) {
  return field.length;
}, '\'' + Constants.MODELS_KEYS.USER.EMAIL + '\' cannot be blank');

ModelSchema.path(Constants.MODELS_KEYS.USER.PASSWORD_HASH).validate(function (field) {
  if (this._password) {
    if (this._password.length < 6) {
      this.invalidate(
        Constants.MODELS_KEYS.USER.PASSWORD,
        '\'' + Constants.MODELS_KEYS.USER.PASSWORD + '\' must be at least 6 characters.'
      );
    }
  }

  if (!this._password) {
    this.invalidate(
      Constants.MODELS_KEYS.USER.PASSWORD,
      '\'' + Constants.MODELS_KEYS.USER.PASSWORD + '\' cannot be blank'
    );
  }
}, null);

ModelSchema.methods = {

  /**
  * authenticate - check if the passwords are the same
  *
  * @param {String} passwordForCheck
  * @return {Boolean}
  * @api public
  */
  authenticate: function (passwordForCheck) {
    return PasswordHash.verify(passwordForCheck, this[Constants.MODELS_KEYS.USER.PASSWORD_HASH])
  },
};

// Ensure virtual fields are serialised.
ModelSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret._id;

    // to avoid leaking password hash and password into web
    delete ret[Constants.MODELS_KEYS.USER.PASSWORD_HASH];
    delete ret[Constants.MODELS_KEYS.USER.PASSWORD];

    delete ret[Constants.MODELS_KEYS.COMMON.CREATED_AT];
    delete ret[Constants.MODELS_KEYS.COMMON.UPDATED_AT];
    return ret;
  },
});

module.exports = Mongoose.model(Constants.MODELS_NAMES.USER, ModelSchema);
