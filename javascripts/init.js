function init_nonworker() {
  test_evolution();
  //test_grapher();
  //test_graph_comparison();
  //benchmark(test_evaluation, 5);
}

function configure_console() {
  console = {
    log: function(msg) {
      postMessage(msg);
    }
  };
}

function init_worker() {
  configure_console();
  importScripts('util.js', 'geepee.js', 'test_programs.js', 'tests.js');
  init_nonworker();
}

if(typeof window === 'undefined') {
  init_worker();
} else {
  window.addEventListener('load', function() {
    document.getElementById('go').addEventListener('click', init_nonworker, false);
    init_nonworker();
  }, false);
}
