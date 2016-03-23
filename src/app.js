var Express = require('express');
var Logger = require('morgan');
var BodyParser = require('body-parser');
var Mongoose = require('mongoose');
var Common = require('./utils/common');

var TodoController = require('./controllers/todos');
var AuthController = require('./controllers/auth');

Mongoose.connect('mongodb://localhost/login_register_db', function (err) {
  if (err) {
    console.log('connection error', err);
  } else {
    console.log('connection successful');
  }
});

var app = Express();

app.use(Logger('dev'));

// sets types of body, which application will be able to parse
app.use(BodyParser.json());

//routes initializing here
app.use('/todos', TodoController);
app.use('/', AuthController);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  // we can implement real html page here
  res.status(404);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  err.status && res.status(err.status) && delete err.status;
  switch (err.name) {
    case 'ValidationError':
      res.status(400);
    break;
    default:
      !res.status && res.status(500);
    break;
  }
  res.json(Common.getErrJson(err, app));
});

module.exports = app;
