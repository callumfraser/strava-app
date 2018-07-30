var mongoose = require('mongoose');

var summarySchema = new mongoose.Schema({
  date: String,
  id: String,
  rides: Object,
  runs: Object
});

var summaryDB = mongoose.model('Strava_summaries', summarySchema);

module.exports = summaryDB;
