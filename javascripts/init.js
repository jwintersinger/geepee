function configure_console() {
  if(typeof console === 'undefined')
    console = {
      log: function(msg) {
        postMessage(msg);
      }
    };
}

function init() {
  configure_console();

  test_evolution();
  //test_grapher();
  //test_graph_comparison();
  //benchmark(test_evaluation, 5);
}

if(typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    document.getElementById('go').addEventListener('click', init, false);
    init();
  }, false);
} else {
  init();
}
