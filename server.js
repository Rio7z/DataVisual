// modules =================================================
const express = require('express');
const router = express.Router();
const request = require('request');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const stylus = require('stylus');
const ENV = require('dotenv').config();
const scrape = require('scrape-twitter');



// configuration ===========================================
app.set('view engine', 'pug')
app.get('/', function (req, res) {
    res.render('index')
  })
// config files
const port = process.env.PORT || 8080; // set our port
const db = require('./config/db');

// connect to our mongoDB database (commented out after you enter in your own credentials)
connectionsubject = mongoose.createConnection(db.urlSubjectViews);



// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);	
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app