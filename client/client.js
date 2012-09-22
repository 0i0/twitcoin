function send(){
	var to = document.getElementById("to").value
    , amount = document.getElementById("amount").value
  console.log('to: '+ to)
  console.log('amount: '+ amount)
  location.replace('/twitter/send/'+to+'/'+amount)
}