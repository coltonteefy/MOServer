var express = require("express");
var PORT = process.env.PORT || 5000;
var path = require("path");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var multer = require('multer');
var router = express.Router();
var userRoutes = require('./routes/user');
var app = express();

app.set('port', (PORT));

var http = require('http').Server(app);

mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://admin2018:admin2018@ds259711.mlab.com:59711/musicondb', {useNewUrlParser: true});

app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/api')), router);
app.use(express.static('upload/'));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//----------------------------------ROUTES----------------------------------

//GET
router.route('/logout').get(userRoutes.logout);
router.route('/getAllUsers').get(userRoutes.getAllUsers);
router.route('/deleteUser/:_id').get(userRoutes.deleteUser);
router.route('/getUserImage/:username').get(userRoutes.getUserImage);

router.route('/getAllMusic').get(userRoutes.getAllMusic);
router.route('/getSingleUserMusic/:username').get(userRoutes.getSingleUserMusic);

//POST
router.route('/register').post(userRoutes.register);
router.route('/login').post(userRoutes.login);
router.route('/updateUser/:_id').post(userRoutes.updateUser);
router.route('/addUserEvent/:username').post(userRoutes.addUserEvent);
router.route('/addUserImage/:username').post(userRoutes.addUserImage);

router.route('/uploadMusic/:username').post(userRoutes.uploadMusic);
router.route('/updateMusicDetailsImmediately/:username').post(userRoutes.updateMusicDetailsImmediately);


// SET APP TO LISTEN ON PORT
http.listen(app.get('port'), function () {
    console.log('Server listening on port', app.get('port'));
});