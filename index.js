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
              console.log(data);
              access_token = data.access_token;
              firstNameBasis = data.athlete.firstname;
              athleteId = data.athlete.id;
              stats;
            } else {
                console.log("error" + xhr.status)
            }
        }
    }
};

var getAthleteStats = function(method, url, data, cb) {
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              stats = data;
            } else {
                console.log("error" + xhr.status)
            }
        }
    }
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
  }

  getAccessToken('POST','https://www.strava.com/oauth/token',JSON.stringify(request_details), redirect());
  //+APIdata[1].responseText.access_token)
});

app.get('/welcome', function(req,res){
  function hello(stats){
    res.send("look at the stats: " + JSON.stringify(stats));
  }
  // res.send("Hi there, " + firstNameBasis + ", let's see how you've been doing.");
  getAthleteStats('GET','https://www.strava.com/api/v3/athletes/'+athleteId+'/stats',null, hello());
});

app.listen(port, function() {
    console.log("App listening on port")
});
