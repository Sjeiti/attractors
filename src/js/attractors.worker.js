/* jshint ignore:start */
onmessage = function(e) {
  console.log('Message received from main script');
  console.log('Posting message back to main script');
  eval(e.data[0]);
  postMessage(e.data[0]);
}

setTimeout(function (){
  postMessage('bar');
},1000);