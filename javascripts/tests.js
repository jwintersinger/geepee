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

function test_graph_comparison() {
  var grapher = new Grapher('graph');
  var test_program = (new TestPrograms()).get(1);

  var gp = new GeePee();
  gp.set_constants(test_program.constants);
  var f = function(x) { return gp.evaluate_indiv(test_program.program, x); };

  grapher.graph_multiple([f, Math.sin], 0, 2*Math.PI);
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
  var test_program = (new TestPrograms()).get(2);
  var gp = new GeePee(test_program.constants);

  var x_values = [];
  for(var x = -Math.PI; x <= Math.PI; x += 0.1)
    x_values.push(x);

  var y_values = gp.evaluate_indiv(test_program.program, x_values);
}

// TODO: Make following methods work without being in GeePee prototype.
GeePee.prototype._test_program = function() {
  var test_inputs = {
    31:   2.52081,
    100: -3.52315,
    69:   4.88815,
    76:   -0.0502623,
  };
  for(var i in test_inputs)
    this._inputs[i] = test_inputs[i];
  console.log(this._calculate_fitness( [111, 31, 110, 112, 100, 69, 76] ));
}

GeePee.prototype._test_crossover = function() {
  var p1 = [112, 111, 31, 47, 110, 39, 52], p2 = [111, 31, 110, 112, 100, 69, 76];
  p1 =  [112, 111, 31, 47, 110, 39, 111, 31, 110, 112, 100, 69, 76];
  p2 =  [112, 111, 31, 47, 110, 39, 111, 31, 110, 112, 100, 69, 76];
  var off = this._crossover(p1, p2);
  console.log(off);
}

GeePee.prototype._test_mutate = function() {
  var p = [112, 111, 31, 47, 110, 39, 52];
  var m = this._mutate(p);
  for(var i = 0; i < m.length; i++)
    console.log(m[i]);
}
