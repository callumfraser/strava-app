var mongoose = require('mongoose');

var summarySchema = new mongoose.Schema({
  id: String,
  summary: Object
});

var summaryDB = mongoose.model('Strava_summaries', summarySchema);

module.exports = summaryDB;
