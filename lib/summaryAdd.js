function summaryAdd(newSummary,newInput,res){
  console.log(newInput.rides);
  console.log(newInput.runs);
newSummary.date = newInput.date;
newSummary.id = newInput.id;
newSummary.rides = newInput.rides;
newSummary.runs = newInput.runs;
newSummary.save(function(err,savedSummary){
  if (err){
    console.log(err)
  }
  else {
    console.log("summary saved");
    // console.log(savedSummary);
    return
  }
})
}

module.exports = summaryAdd;
