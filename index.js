var express = require('express');
var app = express();
var express_handlebars = require('express-handlebars');
var port = process.env.PORT || 4000;
var $ = require('jquery');
app.engine('handlebars', express_handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.get('/', function(req,res){
  res.render('landing', {
      message: "Welcome to my Strava Visualisation App! Please click below to login via Strava"
  });
});

app.post('/', function(req,res){
  if (login){
    res.redirect("https://www.strava.com/oauth/authorize?client_id=27332&redirect_uri=https://gentle-falls-53808.herokuapp.com/user/&response_type=code");
  }
});

app.get('/user', function(req,res){
  res.send("Hello, Callum. Are you accessing from " + req.protocol + "://" + req.get('host') + req.originalUrl + "?");
})

app.listen(port, function() {
    console.log("App listening on port")
});
