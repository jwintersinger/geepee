Grapher = function(graph_id) {
  this._canvas = document.getElementById(graph_id);
  this._ctx = this._canvas.getContext('2d');
  this._line_width = 2;

  //this._ctx.translate(0, this._canvas.height/2);
  return;

  this._ctx.beginPath();
  this._ctx.arc(0, 0, 1, 0, 2*Math.PI, false);
  this._ctx.fill();
}

// Remember, unless y_min < 0 && y_max > 0, x-axis won't be visible; similar holds true for y-axis.
Grapher.prototype._draw_axes = function(x_min, x_max, y_min, y_max) {
  this._ctx.save();
  this._ctx.beginPath();

  // x axis
  var pixel_y = this._graph_to_screen_y(0, y_min, y_max);
  this._ctx.moveTo(0, pixel_y);
  this._ctx.lineTo(this._canvas.width, pixel_y);

  // y axis
  var pixel_x = this._graph_to_screen_x(0, x_min, x_max);
  this._ctx.moveTo(pixel_x, 0);
  this._ctx.lineTo(pixel_x, this._canvas.height);

  this._ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  this._ctx.stroke();
  this._ctx.restore();
}

// Convert from screen units to graph units for x.
Grapher.prototype._graph_to_screen_x = function(x, x_min, x_max) {
  // Ensure half of line is not cut off at extreme left/right of graph.
  var canvas_width = this._canvas.width - this._line_width;
  var ratio = canvas_width / (x_max - x_min);
  var pixel_x = ratio*(x - x_min);
  // Translate graph down by half of line width to complete correction that ensures half of line is
  // not cut off.
  pixel_x += this._line_width/2;
  return pixel_x;
}

// Convert from graph units to screen units for y.
Grapher.prototype._graph_to_screen_y = function(y, y_min, y_max) {
  // Ensure half of line is not cut off at extreme top/bottom of graph.
  var canvas_height = this._canvas.height - this._line_width;
  var ratio = canvas_height / (y_max - y_min);
  var pixel_y = ratio*(y - y_min);
  // Reflect graph vertically, since canvas' y-coordinates increase as one moves down, while on the
  // graph they increase as one moves up.
  pixel_y = canvas_height - pixel_y;
  // Translate graph down by half of line width to complete correction that ensures half of line is
  // not cut off.
  pixel_y += this._line_width/2;
  return pixel_y;
}

Grapher.prototype._screen_to_graph_x = function(pixel_x, x_min, x_max) {
  return (pixel_x / this._canvas.width)*(x_max - x_min) + x_min;
}

Grapher.prototype._evaluate = function(f, x_min, x_max) {
  var y_values = new Array(this._canvas.width);
  for(var pixel_x = 0; pixel_x < y_values.length; pixel_x++) {
    var graph_x = this._screen_to_graph_x(pixel_x, x_min, x_max);
    y_values[pixel_x] = f(graph_x);
  }
  return y_values;
}

Grapher.prototype._find_extrema = function(points) {
  return { min: Util.least(points), max: Util.greatest(points) };
}


Grapher.prototype._draw_graph = function(y_values, y_min, y_max, colour) {
  this._ctx.save();
  this._ctx.fillStyle = colour;
  for(var pixel_x = 0; pixel_x < y_values.length; pixel_x++) {
    var pixel_y = this._graph_to_screen_y(y_values[pixel_x], y_min, y_max);
    this._ctx.beginPath();
    this._ctx.arc(pixel_x, pixel_y, this._line_width/2, 0, 2*Math.PI, false);
    this._ctx.fill();
  }
  this._ctx.restore();
}

Grapher.prototype.graph = function(f, x_min, x_max) {
  return this.graph_multiple([f], x_min, x_max);
}

Grapher.prototype.graph_multiple = function(functions, x_min, x_max, colours) {
  var y_values = new Array(functions.length), extrema = new Array(functions.length);
  for(var i = 0; i < functions.length; i++) {
    y_values[i] = this._evaluate(functions[i], x_min, x_max);
    extrema[i] = this._find_extrema(y_values[i]);
  }

  var minima = extrema.map(function(e) { return e.min; });
  var maxima = extrema.map(function(e) { return e.max; });
  var y_min = Util.least(minima);
  var y_max = Util.greatest(maxima);

  this._clear(); // Clear any previously drawn graphs.
  this._draw_axes(x_min, x_max, y_min, y_max);

  for(var i = 0; i < y_values.length; i++)
    this._draw_graph(y_values[i], y_min, y_max, colours[i]);
}

Grapher.prototype._clear = function() {
  this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
}
