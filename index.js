var express = require('express');
var app = express();
var express_handlebars = require('express-handlebars');
var port = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var url = require('url');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var access_token;
var firstNameBasis = "noName";
var athleteId;
var message;
var strava = require('strava-v3');
var summaryDB = require('./lib/summary_schema');
var summaryAdd = require('./lib/summaryAdd');
var sortActivities = require('./lib/sortActivities');
var mongoose = require('mongoose');
var moment = require('moment');
var dateCreatedAt;
var searchID = require('./lib/summarySearch');
var Handlebars = require('handlebars');
var newInput;
var session = require('express-session');



app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Methods', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(session({
    secret: "callum123",
    resave: false,
    saveUnititialized: true
}))
app.use(bodyParser.json());

app.use(express.static('./public'));


Handlebars.registerHelper('cleanDate', function(date) {
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var actDate = new Date(date);
  return actDate.toLocaleDateString("en-US", options);
});

const mongoURL = process.env.MONGO_DB_URL || "mongodb://localhost/StravaAPIs"
mongoose.connect(mongoURL);


app.engine('handlebars', express_handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function(req,res){
  res.render('landing', {
      message: "Welcome to my Strava Visualisation App! Please click below to login via Strava"
  });
});

app.post('/', function(req,res){
  var logIn = req.body.logIn;
  if (logIn){
    res.redirect("https://www.strava.com/oauth/authorize?client_id=27332&redirect_uri=https://gentle-falls-53808.herokuapp.com/user/&response_type=code");
  }
});

app.get('/user', function(req,res){
  var currUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
  var urlQ = url.parse(currUrl, true);
  var c = urlQ.query.code;

  strava.oauth.getToken(c,function(err,payload,limits){
    message = "";
    console.log("strava.oauthGET PAYLOAD!!");
    console.log(payload);
    access_token = payload.access_token;
    firstNameBasis = payload.athlete.firstname;
    athleteId = payload.athlete.id;
    dateCreatedAt = payload.athlete.created_at;
    req.session.user = payload.athlete.firstname;
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req,res){
  var getDate = moment().subtract(3, 'months');
  var threeMonthsAgo = new Date(getDate.format());

  var startReqDate = threeMonthsAgo;
  var accountStartDate = new Date(dateCreatedAt);
  if (accountStartDate.getTime() > threeMonthsAgo.getTime()){
    startReqDate = dateCreatedAt;
  };
  strava.athlete.listActivities({
      id: athleteId,
      'access_token':access_token
  },
  function(err,payload,limits) {
    // console.log(payload);
    var query = {
      'id': athleteId
    };
    console.log("HOW MANY ARE THERE!!")

    var previousSummaries = searchID(summaryDB,query);
    newInput = sortActivities(payload,startReqDate,athleteId);


    function renderResults(){
      console.log(previousSummaries.length);
      console.log("RENDER THESE -> ")
      // console.log(previousSummaries);
      res.render('user', {
          newInput: newInput,
          firstName: firstNameBasis,
          previousSummaries: previousSummaries,
          message: message
      });
    };

    if (req.session.user === firstNameBasis){
      setTimeout(renderResults, 3000);
    } else {
      res.send("Unauthorized to view this page. Please return to login.");
    }





  });
});

app.post('/welcome', function(req,res){
  var logOut = req.body.logOut;
  var saveSummary = req.body.saveSummary
  if (logOut){
    strava.oauth.deauthorize({}, function(err,payload,limits){
      req.session.user = null;
      res.redirect('/');
      message = "";
    })
  }
  if (saveSummary){
    var newSummary = new summaryDB();
    summaryAdd(newSummary, newInput);
    message = "Summary saved successfully!";
    res.redirect('/welcome');
  }
})

app.listen(port, function() {
    console.log("App listening on port" + port);
});
