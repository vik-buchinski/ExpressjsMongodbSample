module.exports = {
  WEB_TOKEN_SECRET: 'ilovescotchyscotch',
  TOKEN_EXPIRATION_TIME: '1d',
  SESSION_TOKEN_KEY: 'Access-Token',
  MODELS_NAMES: {
    USER: 'User',
    SESSION: 'Session',
  },
  MODELS_KEYS: {
    USER: {
      EMAIL: 'email',
      PASSWORD_HASH: 'password_hash',
      PASSWORD: 'password',
    },
    COMMON: {
      CREATED_AT: 'created_at',
      UPDATED_AT: 'updated_at',
    },
    SESSION: {
      USER_ID: 'user_id',
      TOKEN: 'token',
      IS_ACTIVE: 'is_active',
    },
  },
};
