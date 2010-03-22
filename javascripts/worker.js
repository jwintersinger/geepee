// Chrome (unlike Firefox) will only initialize workers if page served over HTTP, not from local
// filesystem. To start test server: python -m SimpleHTTPServer 9999
window.addEventListener('load', function() {
  var worker = new Worker('javascripts/init.js');

  worker.onmessage = function(event) {
    var handlers = {
      best_indiv: function(data) {
        var grapher = new Grapher('graph');
        var evaluator = new GeePee();
        evaluator.set_constants(data.constants);
        var f = function(x) { return evaluator.evaluate_indiv(data.indiv, x); };
        grapher.graph_multiple([f, Math.sin], 0, 2*Math.PI);
      },

      stats: function(data) {
        for(var key in data)
          document.getElementById(key).innerHTML = data[key];
      }
    };

    var type = event.data.type;
    delete event.data.type;
    handlers[type](event.data);
  };
}, false);
