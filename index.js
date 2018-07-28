var express = require('express');
var app = express();
var port = 4000;

function testHeroku(name){
  return "Hi there, " + name;
}

app.get('/', function(req,res){
  res.send(testHeroku("Callum"));
});

app.listen(port, function() {
    console.log("App listening on port")
});
