var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

const models = require('./models/index');
models.sequelize.authenticate().then(async () => {
  console.log("connected to database", CONFIG.db_name);
  models.sequelize.sync().then(async () => {
    console.log("Syncing DB");
  }).catch((syncErr) => {
    console.error("Unable to sync to  database:", CONFIG.db_name, syncErr.message);
  })

}).catch((error) => {
  console.log("Unable to connect to database", error.message);
})


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use('/v1', require('./controller/common.controller').router);
app.use('/v1/auth', require('./controller/auth.controller').router);
app.use('/v1/profile', require('./controller/profile.controller').router);
app.use('/v1/match', require('./controller/match.controller').router);

module.exports = app;
