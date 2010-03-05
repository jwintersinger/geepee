function test_graph_comparison() {
  var grapher = new Grapher('graph');
  var test_program = (new TestPrograms()).get(0);
  var gp = new GeePee();
  grapher.compare_target_to_evolved(gp, -Math.PI, Math.PI, Math.sin,
    test_program.program, test_program.constants);
}

function test_grapher() {
  var grapher = new Grapher('graph');
  var functions = [
    Math.sin,
    Math.cos,
    function(x) { return Math.pow(x, 2); }
  ];
  grapher.graph_multiple(functions, 0, 2*Math.PI);
}

function test_evolution() {
  var gp = new GeePee();
  gp.evolve();
}

function test_evaluation() {
  var test_program = (new TestPrograms()).get(0);
  var gp = new GeePee();

  var x_values = [];
  for(var x = -Math.PI; x <= Math.PI; x += 0.1)
    x_values.push(x);

  var y_values = gp.evaluate_indiv(test_program.program, x_values, test_program.constants);
}

function benchmark(f, runs) {
  var run_times = new Array(runs);

  for(var i = 0; i < run_times.length; i++) {
    var start_time = Date.now();
    f();
    var end_time = Date.now();
    var elapsed = end_time - start_time;
    run_times[i] = elapsed;
    console.log('Completed run ' + (i + 1) + ' in ' + elapsed + ' ms');

  }

  var total_run_time = 0;
  for(var i = 0; i < run_times.length; i++) {
    console.log('Run ' + (i + 1) + ': ' + run_times[i] + ' ms');
    total_run_time += run_times[i];
  }
  console.log('Mean run time: ' + total_run_time/runs + ' ms');
}

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

  //test_evolution();
  //test_grapher();
  //test_graph_comparison();
  benchmark(test_evaluation, 3);
}

if(typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    document.getElementById('go').addEventListener('click', init, false);
    init();
  }, false);
} else {
  init();
}
