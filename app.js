/**
 * Various Express Configurations
 *
 * @type {exports}
 */
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors=require('cors');

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var login = require('./routes/login');

var install=require('./modules/install'); //to create a default user

var User=require('./models/user');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
require('./routes/passport-config')(LocalStrategy,passport,User); // Set up Authentication


var app = express();

//connect to our database
var mongoose = require('mongoose');

var dbName='spblogger';

var connectionString='mongodb://localhost:27017/'+dbName;

if(process.env.OPENSHIFT_MONGODB_DB_URL){
  connectionString = process.env.OPENSHIFT_MONGODB_DB_URL + dbName;
}

mongoose.connect(connectionString);

install.generateAdmin();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({origin:'http://localhost:8000',credentials:true}));

app.use(session({secret: '$2a$10$.wpd8jJriLDRXwptB8jI.usYQUELftTl/.OJ2DRuR8T/qtlUb7WEm',httpOnly: true,saveUninitialized: true, resave: true,cookie: { maxAge: 1800000 }}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/api', posts);
app.use(login);



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
