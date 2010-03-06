window.addEventListener('load', function() {
  var worker = new Worker('javascripts/init.js');
  worker.onmessage = function(event) {
    console.log(event.data);
  };
}, false);
