var express = require('express');
var app = express();
var express_handlebars = require('express-handlebars');
var port = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var url = require('url');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var access_token;

app.engine('handlebars', express_handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


var loadAjaxPost = function(method, url, data, cb) {
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              console.log("LOADAJAXPOST" + data);
              getAccessToken(data);
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
  var getAccessToken = function(data){
    console.log("GET ACCESS TOKEN /n" + data);
    // access_token = data.access_token;
    res.send("HIEHGIWEHGWEIGH " + data);
  };

  var currUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
  var urlQ = url.parse(currUrl, true);
  var c = urlQ.query.code;
  var request_details = {
    client_id: 27332,
    client_secret: '968c5ae97ac54bbe805dc32e1e81efd7d3a07258',
    code: c
  };
  console.log(request_details);

  loadAjaxPost('POST','https://www.strava.com/oauth/token',JSON.stringify(request_details), getAccessToken());
  //+APIdata[1].responseText.access_token)
})

app.listen(port, function() {
    console.log("App listening on port")
});
