var express = require('express');
var app = express();


function testHeroku(name){
  return "Hi there, " + name;
}

app.get('/', function(req,res){
  res.send(testHeroku("callum"));
});
