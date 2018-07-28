function summaryAdd(newStock,newInput,res){
newStock.id = newInput.id;
newStock.summary = newInput.summary;
newStock.save(function(err,savedShoe){
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
