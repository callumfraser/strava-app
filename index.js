var express = require('express');
var app = express();
var express_handlebars = require('express-handlebars');
var port = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var url = require('url');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

var loadAjaxPost = function(method, url, data, cb) {
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log(xhr);
              cb();
            } else {
                console.log("error" + xhr.status)
            }
        }
    }
};

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
  var urlQ = url.parse(req.originalUrl, true);
  console.log(urlQ);
  var c = urlQ.code;
  var APIdata;
  var request_details = {
    client_id: 27332,
    client_secret: '968c5ae97ac54bbe805dc32e1e81efd7d3a07258',
    code: c
  };
  console.log(request_details);
  loadAjaxPost('POST','https://www.strava.com/oauth/token',JSON.stringify(request_details), function(data){
    APIdata = data;
    console.log(data);
  });
  res.send(APIdata);
})

app.listen(port, function() {
    console.log("App listening on port")
});
