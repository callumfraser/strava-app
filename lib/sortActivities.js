var moment = require('moment');

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
    avPerWeek: avPerWeek.toFixed(2),
    avDistancePerAct: avDistancePerAct.toFixed(2),
    avAvSpeedPerAct: avAvSpeedPerAct.toFixed(2),
    fastestAvSpeed: fastestAvSpeed.toFixed(2),
    longestActDistance:  longestActDistance,
    longestActDuration: longestActDuration
  }
  return summary;
};



function analyseActivities(runs,rides,weeks,athleteId){
  var now = moment().format();
  var runSummary = {};
  var rideSummary = {};
  var emptySet = {
    avPerWeek: 0,
    avDistancePerAct: 0,
    avAvSpeedPerAct: 0,
    fastestAvSpeed: 0,
    longestActDistance:  0,
    longestActDuration: 0
  };
  if (runs.length > 0){
    runSummary = calculateActivities(runs,weeks);
  } else {
    runSummary = emptySet;
  };
  if (rides.length > 0){
    rideSummary = calculateActivities(rides,weeks);
  } else {
    rideSummary = emptySet;
  };
  var completeSummary = {
    date: now,
    id: athleteId,
    rides: rideSummary,
    runs: runSummary
  };
  return completeSummary;
};

function sortActivities(response,startTime,athleteId){
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
      } else if (response[i].type == "Ride"){
        rides.push(response[i]);
      };
    };
  };
  return analyseActivities(runs,rides,weeks,athleteId);
};


module.exports = sortActivities;
