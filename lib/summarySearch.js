function summarySearch(database, query) {
  console.log(query);
  var summaryResult = [];
  database.find(query, function(err, results) {
    if (err) {
      console.log(err)
    } else if (!results){
      console.log("nothing found");
      return "No previous summaries";
    } else if (results) {
      results.forEach(function(summary) {
        console.log("SUMMARY -> ");
        console.log(summary);
        summaryResult.push(summary);
        console.log(summaryResult);
      });
    };
        // res.send(shoesResult)
        return summaryResult;
    });
};

module.exports = summarySearch
