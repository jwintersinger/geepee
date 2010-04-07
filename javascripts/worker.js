// Workaround for IE, which lacks support for addEventListener.
if(window.addEventListener === undefined)
  window.addEventListener = function(type, listener, useCapture) {
    window.attachEvent('on'+type, listener);
  };

// Chrome (unlike Firefox) will only initialize workers if page served over HTTP, not from local
// filesystem. To start test server: python -m SimpleHTTPServer 9999
window.addEventListener('load', function() {
  var colours = {
    evolved: 'rgb(0,255,0)',
    target:  'rgb(0,0,255)'
  };
  var graph_id = 'graph';

  colour_legend(colours);
  if(check_browser_support(graph_id))
    start_worker(graph_id, colours);
}, false);

// Make legend keys the same colour as curves on graph.
function colour_legend(colours) {
  for(legend_key in colours)
    document.getElementById(legend_key).style.color = colours[legend_key];
}

function start_worker(graph_id, colours) {
  var worker = new Worker('javascripts/init.js');
  worker.onmessage = function(event) {
    var handlers = {
      best_indiv: function(data) {
        // Graph target and evolved functions.
        var grapher = new Grapher(graph_id);
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
    } else {
      console.log(data);
    }
  };
}

// Returns true if browser supports necessary features, false otherwise.
function check_browser_support(graph_id) {
  var unsupported_features = [];

  if(document.getElementById(graph_id).getContext === undefined)
    unsupported_features.push('canvas');
  if(typeof Worker === 'undefined')
    unsupported_features.push('Web Workers');

  if(unsupported_features.length > 0) {
    document.getElementById('unsupported_features').innerHTML = unsupported_features.join(' and ');
    document.getElementById('unsupported').style.display = 'block';
    return false;
  } else {
    return true;
  }
}
