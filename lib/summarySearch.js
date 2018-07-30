function summarySearch(database, query) {
  var summaryResult = [];
  database.find(query, function(err, results) {
    if (err) {
      console.log(err)
    } else if (!results){
      console.log("nothing found");
      return "No previous summaries";
    } else if (results) {
      results.forEach(function(summary) {
        summaryResult.push(summary);
      });
    };
        // res.send(shoesResult)
        return summaryResult;
    });
};

module.exports = summarySearch
