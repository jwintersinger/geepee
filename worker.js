window.addEventListener('load', function() {
  var worker = new Worker('geepee.js');
  worker.onmessage = function(event) {
    console.log(event.data);
  };
}, false);
