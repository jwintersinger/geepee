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
  },

  // Returns least element in seq.
  least: function(seq) {
    return seq.reduce(function(previous, current) {
      return previous < current ? previous : current;
    });
  },

  // Returns greatest element in seq.
  greatest: function(seq) {
    return seq.reduce(function(previous, current) {
      return previous > current ? previous : current;
    });
  }
}
