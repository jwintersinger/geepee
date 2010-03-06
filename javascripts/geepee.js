function GeePee(inputs) {
  this._set_class_constants();
  // Allow inputs to be set to allow for test programs to run with same constants that were used
  // during their evolution.
  if(typeof inputs === 'undefined')
    this._generate_inputs();
  else
    this._inputs = inputs;
  this._create_random_pop();

  //this._test_crossover();
}

// TODO: remove test methods.
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

GeePee.prototype._set_class_constants = function() {
  this._OPS = {
    ADD: 110,
    SUB: 111,
    MUL: 112,
    DIV: 113
  };
  this._OPS_START = this._OPS.ADD;
  this._OPS_END   = this._OPS.DIV;

  this._MAX_INDIV_SIZE    = 1e4;
  this._POP_SIZE          = 1e3;
  this._MAX_INITIAL_DEPTH = 5;
  this._GENERATIONS       = 1e2;

  this._CROSSOVER_PROB       = 0.9;
  this._PERMUT_PROB_PER_NODE = 0.05;
  this._TOURNAMENT_SIZE      = 2;

  this._NUM_VARIABLES = 1;

  this._NUM_CONSTANTS = 1e2;
  this._CONSTANT_MIN  = -5;
  this._CONSTANT_MAX   = 5;

  this._BEST_POSSIBLE_FITNESS  = 0;
  this._WORST_POSSIBLE_FITNESS = Number.MAX_VALUE;

  this._TARGET_INPUT_START = 0;
  this._TARGET_INPUT_END   = 2*Math.PI;
  this._TARGET_INPUT_STEP  = 0.1;
  this._TARGET_FUNCTION    = Math.sin;

  this._INPUTS_LEN = this._NUM_VARIABLES + this._NUM_CONSTANTS;

  // Check is > rather than >=, as inputs indicated by primitives in range
  // [0, this._INPUTS_LEN - 1]. Even if this._INPUTS_LEN==this._OPS_START, primitive will be
  // unambiguous, for the last primitive will have an index of this._INPUTS_LEN-1.
  if(this._INPUTS_LEN > this._OPS_START)
    throw 'Number of constants and variables exceeds index of first instruction.'
}

GeePee.prototype._generate_inputs = function() {
  this._inputs = new Array(this._INPUTS_LEN);

  // Fill this._inputs with random constants, leaving enough elements at beginning for inputs from
  // each fitness case.
  for(var i = this._NUM_VARIABLES; i < this._inputs.length; i++) {
    this._inputs[i] = Util.random_float(this._CONSTANT_MIN, this._CONSTANT_MAX);
  }
}

GeePee.prototype._create_random_pop = function() {
  this._pop          = new Array(this._POP_SIZE);
  this._fitnesses    = new Array(this._POP_SIZE);

  for(var i = 0; i < this._pop.length; i++)
    this._insert_into_pop(this._create_random_indiv(), i);
}

GeePee.prototype._print_stats = function(generation) {
  var len_sum     = 0; // Summed lengths of all individuals
  var fitness_sum = 0;
  var best, best_size, best_fitness = this._WORST_POSSIBLE_FITNESS;
  var worst, worst_size, worst_fitness = this._BEST_POSSIBLE_FITNESS;
  var pop_size = this._pop.length;

  for(var i = 0; i < pop_size; i++) {
    len_sum     += this._pop[i].length;
    fitness_sum += this._fitnesses[i];

    if(this._fitnesses[i] < best_fitness) {
      best = i;
      best_fitness = this._fitnesses[best];
    }
    if(this._fitnesses[i] > worst_fitness) {
      worst = i;
      worst_fitness = this._fitnesses[worst];
    }
  }

  var best_size = this._pop[best].length, worst_size = this._pop[worst].length;

  //console.log('[' + this._inputs.join(', ') + ']');
  //console.log('[' + this._pop[best].join(', ') + ']');
  console.log(
    'gen='   + generation +
    ' best_fit='   + best_fitness.toFixed(2) +
    ' best_size='  + best_size +
    ' worst_fit='  + worst_fitness.toFixed(2) +
    ' worst_size=' + worst_size +
    ' avg_fit='    + (fitness_sum/pop_size).toFixed(2) +
    ' avg_size='   + (len_sum/pop_size).toFixed(2)
  );
}

GeePee.prototype._create_random_indiv = function() {
  var indiv = [];
  this._grow_indiv(indiv, this._MAX_INITIAL_DEPTH);
  return indiv;
}

GeePee.prototype._grow_indiv = function(indiv, depth) {
  if(indiv.length >= this._MAX_INDIV_SIZE)
    return;

  if(indiv.length === 0) var choose_op = true;
  else if(depth === 0)   var choose_op = false;
  else                   var choose_op = Util.random_bool();

  if(!choose_op) { // Choose input.
    // Input will be constant or variable.
    indiv.push(this._generate_input());
    return;
  } else {         // Choose operator.
    indiv.push(this._generate_op());
    // Add two more primitives (i.e., two ops or values) so that op has something to operate on.
    // Note all our operators have an arity of two.
    for(var i = 0; i < 2; i++)
      this._grow_indiv(indiv, depth - 1);
    return;
  }
}

// Ideally, we'd calculate the fitness as the absolute value of the definite integral of
// (f(x) = target_f(x) - evolved_f(x)), but doing so is enormously difficult. Instead, we calculate
// the sum of errors between target_f(x) and evolved_f(x) for a given set of x-values.
//
// In order to preserve expectation that larger fitness values indicate more fit functions, we
// return the *negative* sum of errors.
GeePee.prototype._calculate_fitness = function(indiv) {
  var fit = 0;
  for(var x = this._TARGET_INPUT_START; x <= this._TARGET_INPUT_END; x += this._TARGET_INPUT_STEP) {
    this._pc = 0;
    this._inputs[0] = x; // TODO: change to accommodate multiple inputs.
    var target = this._TARGET_FUNCTION(x);
    var result = this._run_indiv(indiv);
    fit += Math.abs(result - target);
  }
  return fit;
}

// Calculates indiv's outputs for set of x_values inputs, using constants.
GeePee.prototype.evaluate_indiv = function(indiv, x_values) {
  var y_values = new Array(x_values.length);

  for(var i = 0; i < x_values.length; i++) {
    this._pc = 0;
    this._inputs[0] = x_values[i]; // TODO: change to accommodate multiple inputs.

    y_values[i] = this._run_indiv(indiv);
  }

  return y_values;
}

GeePee.prototype._is_op = function(primitive) {
  return primitive >= this._INPUTS_LEN;
}

GeePee.prototype._is_input = function(primitive) {
  return primitive < this._INPUTS_LEN;
}

GeePee.prototype._generate_op = function() {
  return Util.random_int(this._OPS_START, this._OPS_END);
}

GeePee.prototype._generate_input = function() {
  return Util.random_int(0, this._INPUTS_LEN - 1);
}

GeePee.prototype._run_indiv = function(indiv) {
  // this._pc++ must be class variable rather than method parameter, as recursive calls for ops must
  // advance the counter as their constants are retrieved. That is, when computing (+ (* a b) c),
  // after the (* a b) component is evaluated, pc must equal 4, so next call to _run_indiv() will
  // retrieve value for c.
  var primitive = indiv[this._pc++];

  if(this._is_input(primitive))
    return this._inputs[primitive];

  // primitive is an op, so evaluate the next two instructions as its parameters.
  var a = this._run_indiv(indiv), b = this._run_indiv(indiv);
  switch(primitive) {
    case this._OPS.ADD: return a + b;
    case this._OPS.SUB: return a - b;
    case this._OPS.MUL: return a * b;
    case this._OPS.DIV:              // Protected division -- prevents division by 0.
      if(Math.abs(b) <= 1e-3) b = 1; // If denominator close to 0, just divide by one.
      return a / b;
    default:
      throw "Unknown primitive: " + primitive;
  }
}

GeePee.prototype._positive_tournament = function() {
  var best, best_fitness = this._WORST_POSSIBLE_FITNESS;

  for(var i = 0; i < this._TOURNAMENT_SIZE; i++) {
    var competitor = Util.random_int(0, this._pop.length - 1);
    if(this._fitnesses[competitor] < best_fitness) {
      best = competitor;
      best_fitness = this._fitnesses[best];
    }
  }

  return best;
}

GeePee.prototype._negative_tournament = function() {
  var worst, worst_fitness = this._BEST_POSSIBLE_FITNESS;

  for(var i = 0; i < this._TOURNAMENT_SIZE; i++) {
    var competitor = Util.random_int(0, this._pop.length - 1);
    if(this._fitnesses[competitor] > worst_fitness) {
      worst = competitor;
      worst_fitness = this._fitnesses[worst];
    }
  }

  return worst;
}

GeePee.prototype._calc_subtree_length = function(indiv, idx) {
  if(this._is_input(indiv[idx]))
    return ++idx;
  return this._calc_subtree_length(indiv, this._calc_subtree_length(indiv, ++idx));
}

// Returns offspring generated from combination of two parents. Note that neither parent1 nor
// parent2 are affected by this operation. Crossover is performed by replacing a random node of
// parent1 with a randomly-chosen subtree of parent2.
GeePee.prototype._crossover = function(parent1, parent2) {
  // To create offspring, tree at xo1 node in parent1 will be replaced by tree at xo2 node from parent2.
  var xo1_start = Util.random_int(0, parent1.length - 1);
  var xo1_end   = this._calc_subtree_length(parent1, xo1_start);
  var xo2_start = Util.random_int(0, parent2.length - 1);
  var xo2_end   = this._calc_subtree_length(parent2, xo2_start);

  var a = parent1.slice(0, xo1_start);       // From start of parent1 to just before node to be replaced.
  var b = parent2.slice(xo2_start, xo2_end); // From start of parent2's replacement node to its end.
  var c = parent1.slice(xo1_end);            // From just after replaced node to end of parent1.
  var ret = a.concat(b, c);
  //console.log([parent1.length, parent2.length, ret.length]);
  return ret;
}

GeePee.prototype._mutate = function(parent) {
  var mutated = parent.slice(0); // Make copy so parent unchanged.
  for(var i = 0; i < mutated.length; i++) {
    if(Math.random() >= this._PERMIT_PROB_PER_NODE)
      continue; // Don't mutate this node.
    mutated[i] = this._is_op(mutated[i]) ? this._generate_op() : this._generate_input();
  }
  return mutated;
}

GeePee.prototype._evolve_new_indiv = function() {
  if(Math.random() < this._CROSSOVER_PROB) {   // Generate new_indiv via crossover.
    var parent1 = this._positive_tournament();
    var parent2 = this._positive_tournament();
    return this._crossover(this._pop[parent1], this._pop[parent2]);
  } else {                                     // Generate new_indiv via mutation.
    var parent = this._positive_tournament();
    return this._mutate(this._pop[parent]);
  }
}

GeePee.prototype._insert_into_pop = function(indiv, idx) {
  this._fitnesses[idx] = this._calculate_fitness(indiv);
  this._pop[idx]       = indiv;
}

GeePee.prototype.evolve = function() {
  for(var gen = 1; gen <= this._GENERATIONS; gen++) {
    for(var indiv = 0; indiv < this._POP_SIZE; indiv++) {
      var new_indiv = this._evolve_new_indiv();
      var out_of_the_pool = this._negative_tournament();
      this._insert_into_pop(new_indiv, out_of_the_pool);
    }
    this._print_stats(gen);
  }
}
