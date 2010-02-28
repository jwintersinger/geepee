function init() {
  new GeePee();
}
window.addEventListener('load', init, false);



function GeePee() {
  this._set_class_constants();
  this._generate_inputs();
  this._create_random_pop();
  console.log(this._calc_avg_indiv_len());
  //this._test_program();
}

// TODO: remove.
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

GeePee.prototype._set_class_constants = function() {
  this._OPS = {
    ADD: 110,
    SUB: 111,
    MUL: 112,
    DIV: 113
  };
  this._OPS_START = this._OPS.ADD;
  this._OPS_END   = this._OPS.DIV;

  this._MAX_INDIV_SIZE = 1e4;
  this._POP_SIZE       = 1e3;
  this._MAX_DEPTH      = 5;

  this._NUM_VARIABLES = 1;

  this._NUM_CONSTANTS = 1e2;
  this._CONSTANT_MIN  = -5;
  this._CONSTANT_MAX   = 5;

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
  this._pop = new Array(this._POP_SIZE);
  for(var i = 0; i < this._pop.length; i++) {
    this._pop[i] = this._create_random_indiv();
    //console.log(this._pop[i]);
    //console.log(this._calculate_fitness(this._pop[i]));
  }
}

GeePee.prototype._calc_avg_indiv_len = function() {
  var avg_len = 0;
  for(var i = 0; i < this._pop.length; i++)
    avg_len += this._pop[i].length;
  return avg_len / this._pop.length;
}

GeePee.prototype._create_random_indiv = function() {
  var indiv = [];
  this._grow_indiv(indiv, this._MAX_DEPTH);
  return indiv;
}

GeePee.prototype._grow_indiv = function(indiv, depth) {
  if(indiv.length >= this._MAX_INDIV_SIZE)
    return;

  if(indiv.length === 0) var choose_op = true;
  else if(depth === 0)   var choose_op = false;
  else                   var choose_op = Util.random_bool();

  if(!choose_op) { // Choose value.
    // Value will be constant or variable.
    var value = Util.random_int(0, this._INPUTS_LEN - 1);
    indiv.push(value);
    return;
  } else {         // Choose operator.
    var op = Util.random_int(this._OPS_START, this._OPS_END);
    indiv.push(op);

    // Add two more primitives (i.e., two ops or values) so that op has something to operate on.
    // Note all our operators have an arity of two.
    for(var i = 0; i < 2; i++)
      this._grow_indiv(indiv, depth - 1);
    return;
  }
}

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

GeePee.prototype._run_indiv = function(indiv) {
  // this._pc++ must be class variable rather than method parameter, as recursive calls for ops must
  // advance the counter as their constants are retrieved. That is, when computing (+ (* a b) c),
  // after the (* a b) component is evaluated, pc must equal 4, so next call to _run_indiv() will
  // retrieve value for c.
  var primitive = indiv[this._pc++];

 // primitive is below ops, so must be an input.
  if(primitive < this._INPUTS_LEN)
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



Util = {
  // Returns random integer in range [min, max].
  random_int: function(min, max) {
    return Math.round(Util.random_float(min, max));
  },

  random_float: function(min, max) {
    return Math.random() * Math.abs(max - min) + min;
  },

  random_bool: function() {
    return Util.random_int(0, 1) === 1;
  }
}
