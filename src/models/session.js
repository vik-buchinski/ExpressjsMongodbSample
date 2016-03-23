var Mongoose = require('mongoose');
var Constants = require('../utils/constants');
var Common = require('../utils/common');

var ModelSchema = new Mongoose.Schema({
  [Constants.MODELS_KEYS.SESSION.USER_ID]: { type: String, default: '' },
  [Constants.MODELS_KEYS.SESSION.TOKEN]: { type: String, default: '' },
  [Constants.MODELS_KEYS.SESSION.IS_ACTIVE]: { type: String, default: true },
}, {
  versionKey: false, // for removing '_v' from database model
  timestamps: {
    createdAt: Constants.MODELS_KEYS.COMMON.CREATED_AT,
    updatedAt: Constants.MODELS_KEYS.COMMON.UPDATED_AT,
  },
});

// Duplicate the ID field.
ModelSchema.virtual('id').get(function () {
  return this._id;
});

// Model validations
ModelSchema.path(Constants.MODELS_KEYS.SESSION.USER_ID).validate(function (field) {
  return field.length;
}, '\'' + Constants.MODELS_KEYS.SESSION.USER_ID + '\' cannot be blank');

ModelSchema.path(Constants.MODELS_KEYS.SESSION.TOKEN).validate(function (field) {
  return field.length;
}, '\'' + Constants.MODELS_KEYS.SESSION.TOKEN + '\' cannot be blank');

ModelSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret._id;

    delete ret[Constants.MODELS_KEYS.SESSION.USER_ID];
    delete ret[Constants.MODELS_KEYS.SESSION.IS_ACTIVE];

    delete ret[Constants.MODELS_KEYS.COMMON.CREATED_AT];
    delete ret[Constants.MODELS_KEYS.COMMON.UPDATED_AT];
    return ret;
  },
});

module.exports = Mongoose.model(Constants.MODELS_NAMES.SESSION, ModelSchema);
