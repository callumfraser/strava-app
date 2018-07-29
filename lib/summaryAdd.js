function summaryAdd(newSummary,newInput,res){
newSummary.id = newInput.id;
newSummary.summary = newInput.summary;
newSummary.save(function(err,savedSummary){
  if (err){
    console.log(err)
  }
  else {
    console.log("summary saved");
    console.log(savedSummary);
    return
  }
})
}

module.exports = summaryAdd;
