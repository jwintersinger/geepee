// Chrome (unlike Firefox) will only initialize workers if page served over HTTP, not from local
// filesystem. To start test server: python -m SimpleHTTPServer 9999
window.addEventListener('load', function() {
  var colours = {
    evolved: 'rgb(0,255,0)',
    target:  'rgb(0,0,255)'
  };
  // Make legend keys the same colour as curves on graph.
  for(legend_key in colours)
    document.getElementById(legend_key).style.color = colours[legend_key];

  var worker = new Worker('javascripts/init.js');
  worker.onmessage = function(event) {
    var handlers = {
      best_indiv: function(data) {
        // Graph target and evolved functions.
        var grapher = new Grapher('graph');
        var evaluator = new GeePee();
        evaluator.set_constants(data.constants);
        var f = function(x) { return evaluator.evaluate_indiv(data.indiv, x); };
        grapher.graph_multiple([f, Math.sin], 0, 2*Math.PI, [colours.evolved, colours.target]);

        // Print human-readable representation of evolved function.
        document.getElementById('best_indiv').innerHTML = evaluator.generate_human_readable(data.indiv);
      },

      stats: function(data) {
        for(var key in data)
          document.getElementById(key).innerHTML = data[key];
      }
    };

    var data = event.data;
    if(data.type !== undefined && handlers[data.type] !== undefined) {
      var type = data.type;
      delete data.type;
      handlers[type](data);
    } else
      console.log(data);
  };
}, false);
