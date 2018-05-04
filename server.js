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
const port = process.env.PORT || 8080; 
const db = require('./config/db');

connectionsubject = mongoose.createConnection(db.urlSubjectViews);



// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(methodOverride('X-HTTP-Method-Override')); 
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); 

// start app ===============================================
app.listen(port);	
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app