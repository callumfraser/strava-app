var express = require('express');
var app = express();
var express_handlebars = require('express-handlebars');
var port = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var url = require('url');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var access_token;
var firstNameBasis;
var athleteId;
var stats;
var strava = require('strava-v3');
var summaryDB = require('./lib/summary_schema');
var summaryAdd = require('./lib/summaryAdd');
var mongoose = require('mongoose');
var moment = require('moment');
var dateCreatedAt;
var searchID = require('./lib/summarySearch');


app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Methods', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// var saveRunSummary(struct){
//   var timeDiff = Math.abs(date2.getTime() - date1.getTime());
//
//
// }
function countWeeks(startTime){
  var now = new Date(moment().format());
  var startDate = new Date(startTime);
  var timeDiff = Math.abs(now.getTime() - startDate.getTime());
  var amountOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  // console.log("AMOUNT OF DAYS: " + amountOfDays);
  var weeks = Math.ceil(amountOfDays/7);
  return weeks;
};

function calculateActivities(activArr,weeks){
  console.log("WEEKS: " + weeks);
  var noOfActs = activArr.length;
  var avPerWeek = noOfActs/weeks;
  var totalDistance = 0;
  var totalAvSpeed = 0;
  var fastestAvSpeed = 0;
  var longestActDistance = 0;
  var longestActDuration = 0;
  for (var i=0;i<activArr.length;i++){
    if (activArr[i].average_speed > fastestAvSpeed){
      fastestAvSpeed = activArr[i].average_speed;
    };
    if (activArr[i].distance > longestActDistance){
      longestActDistance = activArr[i].distance;
    }
    if (activArr[i].elapsed_time > longestActDuration){
      longestActDuration = activArr[i].elapsed_time;
    }
    totalDistance += activArr[i].distance;
    totalAvSpeed += activArr[i].average_speed;
  };
  var avDistancePerAct = (totalDistance/noOfActs);
  var avAvSpeedPerAct = (totalAvSpeed/noOfActs);
  var summary = {
    avPerWeek: avPerWeek,
    avDistancePerAct: avDistancePerAct,
    avAvSpeedPerAct: avAvSpeedPerAct,
    fastestAvSpeed: fastestAvSpeed,
    longestActDistance:  longestActDistance,
    longestActDuration: longestActDuration
  }
  return summary;
};



function analyseActivities(runs,rides,weeks){
  var now = moment().format();
  var runSummary = {};
  var rideSummary = {};
  if (runs.length > 0){
    runSummary = calculateActivities(runs,weeks);
  };
  if (rides.length > 0){
    rideSummary = calculateActivities(rides,weeks);
  };
  var completeSummary = {
    date: now,
    id: athleteId,
    rides: rideSummary,
    runs: runSummary
  };
  return completeSummary;
};

function sortActivities(response,startTime){
  // console.log("SORT ACTIVITIES -> " + response)
  var startDateVal = new Date(startTime).getTime();
  var weeks = countWeeks(startTime);
  var runs = [];
  var rides = [];
  for (var i=0;i<response.length;i++){
    var actDate = new Date(response[i].start_date).getTime();
    if (actDate > startDateVal){
      if (response[i].type == "Run"){
        runs.push(response[i]);
      } else if (response[i].type == "Walk"){
        rides.push(response[i]);
      };
    };
  };
  return analyseActivities(runs,rides,weeks);
};




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


var getAccessToken = function(method, url, data, cb) {
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              // console.log(data);
              access_token = data.access_token;
              firstNameBasis = data.athlete.firstname;
              athleteId = data.athlete.id;
              dateCreatedAt = data.athlete.created_at;
              // console.log("DATE CREATED AT = " + dateCreatedAt);
              cb;
            } else {
                console.log("error" + xhr.status);
            };
        };
    };
};

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
  var request_details = {
    client_id: 27332,
    client_secret: '968c5ae97ac54bbe805dc32e1e81efd7d3a07258',
    code: c
  };
  console.log(request_details);
  function redirect(){
    res.redirect('/welcome');
  };
  getAccessToken('POST','https://www.strava.com/oauth/token',JSON.stringify(request_details),  redirect());
  //+APIdata[1].responseText.access_token)
});

app.get('/welcome', function(req,res){
  var getDate = moment().subtract(3, 'months');
  var threeMonthsAgo = new Date(getDate.format());

  // res.send("Hi there, " + firstNameBasis + ", let's see how you've been doing.");
  var startReqDate = threeMonthsAgo;
  var accountStartDate = new Date(dateCreatedAt);
  if (accountStartDate.getTime() > threeMonthsAgo.getTime()){
    startReqDate = dateCreatedAt;
  };
  // console.log("START REQ DATE " + startReqDate);
  strava.athlete.listActivities({
      // 'id':athleteId,
      id: athleteId,
      // 'after': threeMonthsAgo,
      'access_token':access_token
  },
  function(err,payload,limits) {
    var query = {
      'id': athleteId
    };
    var previousSummaries = searchID(summaryDB,query);
    var newInput = sortActivities(payload,startReqDate);
    console.log(newInput);
    var newSummary = new summaryDB();
    summaryAdd(newSummary, newInput, res);
    console.log("PREVIOUS SUMMARIES !! -> ");

    function renderResults(){
      res.render('user', {
          newInput: newInput,
          firstName: firstNameBasis,
          previousSummaries: previousSummaries
      });
    }

    setTimeout(renderResults(), 2000);
    // console.log(payload);


  });
});

app.listen(port, function() {
    console.log("App listening on port" + port);
});
