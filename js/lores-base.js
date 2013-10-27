// Lores.js - base module
// (c) Ondrej Hruska 2013
// www.ondrovo.com

// MIT license


/* Display module with mouse input */
function LoresDisplay(element, options) {
	
	var self = this;
	
	this.wrapper = $(element);
	options = options || {};
	options.width = options.width || $(element).width();
	options.height = options.height || $(element).height();
	options.cols = options.cols || 16;
	options.rows = options.rows || 16;
	options.bg = options.bg || 0;
	options.fg = options.fg || 1;
	
	options.colors = new LoresPalette(options.colors) || new LoresPalette();
	
	options.filter = options.filter || new LoresColorFilter();
	
	this.colors = options.colors;
	this.filter = options.filter;
	
	this.width = options.width;
	this.height = options.height;

	this.rows = options.rows;
	this.cols = options.cols;
	
	this.pixelWidth = (this.width/this.cols);
	this.pixelHeight = (this.height/this.rows);

	this.bg = options.bg;
	this.fg = options.fg;
	
	
	// build a canvas
	//this.wrapper.empty();
	
	this.canvas = $('<canvas/>')
		.css({position: "absolute", left: 0, top: 0})
		.attr({"width": this.width, "height": this.height})
		.appendTo(this.wrapper);
	
	this.context = this.canvas[0].getContext('2d');
	
	this.erase(true);
	
	
	// mouse input
	
	// undefined if none
	this.moveHandler = options.moveHandler;
	this.rawMoveHandler = options.rawMoveHandler;
	
	this.clickHandler = options.clickHandler;
	this.rawClickHandler = options.rawClickHandler;
	
	this.mouseDown = false;
	
	this.lastMousePos = {x:-1,y:-1,outside:true};
	this.lastMousePosRaw = {x:-1,y:-1,outside:true};
	
	
	// add click handler
	$(this.canvas).on('click', function(evt) {
		var pos = self._getMousePos(self.canvas, evt);
		
		if(self.rawClickHandler) {
			var pixel = {
				x: pos.x,
				y: pos.y,
				outside: false,
			};
			
			self.rawClickHandler(pixel, self);
		}
		
		if(self.clickHandler) {
			
			var pixel = {
				x: Math.floor(pos.x / self.pixelWidth),
				y: Math.floor(pos.y / self.pixelHeight),
			};
		
			self.clickHandler(pixel, self);
		}
	});
	
	
	// add move handler
	$(window).on('mousemove', function(evt) {
		var pos = self._getMousePos(self.canvas, evt);

		
		if(self.rawMoveHandler) {
			var pixel = {
				x: pos.x,
				y: pos.y,
				outside: false,
			};
			
			if(pixel.x < 0 || pixel.x >= self.width || pixel.y < 0 || pixel.y >= self.height) {
				pixel.outside = true;
			}
		
			self.rawMoveHandler(pixel, self);
			self.lastMousePosRaw = pixel;
		}
		
		if(self.moveHandler) {
			var pixel = {
				x: Math.floor(pos.x / self.pixelWidth),
				y: Math.floor(pos.y / self.pixelHeight),
				outside: false,
			};
			
			if(pixel.x < 0 || pixel.x >= self.cols || pixel.y < 0 || pixel.y >= self.rows) {
				pixel.outside = true;
			}
			
			if(self.lastMousePos.x != pixel.x || self.lastMousePos.y != pixel.y) {
				self.moveHandler(pixel, self.lastMousePos, self);
				self.lastMousePos = pixel;
			}
		}
	});
	
	
	$(window).on('mousedown', function(evt) {
		self.mouseDown = true;
	});
	
	
	$(window).on('mouseup', function(evt) {
		self.mouseDown = false;
	});
};


LoresDisplay.prototype.erase = function(fillWithBg) {

	if(fillWithBg) {
		this.fill(this.bg);
	} else {
		this.context.clearRect(0,0,this.width,this.height);
	}
};


LoresDisplay.prototype.fill = function(color) {

	color = this.resolveColor(color);
	
	if(color == -1) {
		color = this.resolveColor(this.bg);
	}	
	
	if(color == -1) {
		this.erase(false);
	} else {
		this.context.fillStyle = color;
		this.context.fillRect(0,0,this.width,this.height);
	}
};


LoresDisplay.prototype.getCanvas = function() {
	return this.canvas;
};


LoresDisplay.prototype.getContext = function() {
	return this.context;
};


LoresDisplay.prototype.getPalette = function() {
	return this.colors;
};


LoresDisplay.prototype.setPalette = function(newPalette) {
	this.colors = newPalette;
};


LoresDisplay.prototype.getColorFilter = function() {
	return this.filter;
};


LoresDisplay.prototype.setColorFilter = function(newFilter) {
	this.filter = newFilter;
};


LoresDisplay.prototype.addFilter = function(from, to) {
	this.filter.addFilter(from, to);
};


LoresDisplay.prototype.removeFilter = function(color) {
	this.filter.removeFilter(color);
};


LoresDisplay.prototype.getPixelSize = function() {
	return {
		x: this.pixelWidth,
		w: this.pixelWidth,
		y: this.pixelHeight,
		h: this.pixelHeight,
	};
};


LoresDisplay.prototype.resolveColor = function(color) {
		
	if(color === undefined || color === null || color === "") {
		throw "Null color";
	} else if(typeof color == "boolean") {
		color = color ? this.fg : this.bg;
	} else if(color == "transparent") {
		color = -1;
	}
	
	color = this.filter.process(color);
	
	
	if(typeof color == "number") {
		
		if(color == -1) return -1; // alpha = bg
		
		var color = this.getColor(color);
		
		if(color === undefined) {
			throw "Undefined color id '" + JSON.stringify(color) + "'";
		}
	}
	
	
	return color;
};


// alias
LoresDisplay.prototype.setColor = function(index, color) {
	this.colors.add(index, color);
};


LoresDisplay.prototype.addColor = function(index, color) {
	this.colors.add(index, color);
};


LoresDisplay.prototype.removeColor = function(index) {
	this.colors.remove(index, color);
};


LoresDisplay.prototype.hasColor = function(index) {
	return index == -1 || this.colors.has(index);
};


LoresDisplay.prototype.getColor = function(index) {
	return this.colors.get(index);
};


LoresDisplay.prototype.setBg = function(color) {
	this.bg = color;
};


LoresDisplay.prototype.erasePixel = function(x, y) {
	this.setPixel(x, y, -1);
};


LoresDisplay.prototype.setPixel = function(x, y, color) {
	
	color = this.resolveColor(color);
	
	if(color == -1) {
		color = this.resolveColor(this.bg);
	}

	x = Math.floor(x);
	y = Math.floor(y);
	
	var x1 = x * this.pixelWidth;
	var y1 = y * this.pixelHeight;
	
	if(color == -1) {
		this.context.clearRect(x1, y1, this.pixelWidth, this.pixelHeight);
	} else {
		this.context.fillStyle = color;
		this.context.fillRect(x1, y1, this.pixelWidth, this.pixelHeight);
	}
};


/* moveHandler(display, pos, lastPos) */
LoresDisplay.prototype.setMoveHandler = function(handler) {
	this.moveHandler = handler;
};


/* rawMoveHandler(display, pos, lastPos) */
LoresDisplay.prototype.setRawMoveHandler = function(handler) {
	this.rawMoveHandler = handler;
};


/* clickHandler(display, pos) */
LoresDisplay.prototype.setClickHandler = function(handler) {
	this.clickHandler = handler;
};


LoresDisplay.prototype.isMouseDown = function() {
	return this.mouseDown;
};


LoresDisplay.prototype.resetMouse = function() {
	this.mouseDown = false;
};


LoresDisplay.prototype._getMousePos = function(canvas, event) {
	var rect = canvas[0].getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
};


LoresDisplay.prototype.getWidth = function() {
	return this.cols;
};


LoresDisplay.prototype.getHeight = function() {
	return this.rows;
};


LoresDisplay.prototype.drawMap = function(map, x, y) {
	
	for(var yy = 0; yy<map.getHeight(); yy++) {
		if(y+yy >= this.rows) break;
		if(y+yy < 0) continue;
		
		for(var xx = 0; xx<map.getWidth(); xx++) {
			
			var color = map.getPixel(xx,yy);
			
			if(x+xx >= this.cols) break;
			if(x+xx < 0) continue;
			
			this.setPixel(x+xx, y+yy, color);
		}
	}
	
};


LoresDisplay.prototype.getMap = function() {
	var map = new LoresPixmap(this.cols, this.rows, this.bg);
	map.connectedDisplay = this;
	return map;
};




/* Color table */
function LoresPalette(values) {
	this.table = {
		0: "#000000",
		1: "#00ff00",
	};
	
	this.table = $.extend( this.table, values );
};


// alias
LoresPalette.prototype.set = function(index, color) {
	this.add(index, color);
};


LoresPalette.prototype.add = function(index, color) {
	this.table[index] = color;
};


LoresPalette.prototype.remove = function(index) {
	delete this.table[index];
};


LoresPalette.prototype.has = function(index) {
	return this.table[index] !== undefined;
};


LoresPalette.prototype.get = function(index) {
	return this.table[index];
};




/* Pixel map */
function LoresPixmap(width, height, fill) {
	
	this.doAutoFlush = true;
	this.connectedDisplay = null;
	if(fill == undefined) fill = -1;
	this.bg = fill;
	
	if(width === undefined || height === undefined) return;
	
	this.width = width;
	this.height = height;
	
	this.map = [];
	
	for(var y=0; y<height; y++) {
		var row = [];
		for(var x=0; x<width; x++) {
			row.push(fill);
		}
		this.map.push(row);
	}
	
}


LoresPixmap.fromArray = function(array){
	var pm = new LoresPixmap();
	pm.setArray(array);
	return pm;
};

LoresPixmap.fromString = function(string, colors, width, height){
	var pm = new LoresPixmap();
	
	var array = [];
	
	if(height == undefined) {
		height = Math.floor(string.length / width);
	}
	
	outer:
	for(var y=0; y<height; y++) {
		var row = [];
		for(var x=0; x<width; x++) {
			
			var char = string.charAt(y*width+x);
			
			if(char == undefined) break outer;
			
			var color = colors[char];
			
			if(color === undefined) color = -1;
			
			row.push(color);
		}
		array.push(row);
	}
	
	pm.setArray(array);
	return pm;
};


LoresPixmap.prototype.setBg = function(color) {
	this.bg = color;
};


LoresPixmap.prototype.erase = function() {
	this.fill(this.bg);
};


LoresPixmap.prototype.fill = function(color) {
	for(var y=0; y<this.height; y++) {
		for(var x=0; x<this.width; x++) {
			this.setPixel(x,y,color);
		}
	}
};


LoresPixmap.prototype.setPixel = function(x,y,color) {
	
	if(x >= this.width || x < 0 || y >= this.height || y < 0 ) return;
	
	if(this.map[y][x] == color) return; // no need to overwrite it
	
	this.map[y][x] = color;
	
	if(color != -1 && this.doAutoFlush && this.connectedDisplay !== null) {
		this.connectedDisplay.setPixel(x,y,color);
	}
};


LoresPixmap.prototype.getPixel = function(x,y) {
	if(x >= this.width || x < 0 || y >= this.height || y < 0 ) return -1;
	
	return this.map[y][x];
};


LoresPixmap.prototype.getArray = function() {
	return this.map;
};


LoresPixmap.prototype.setArray = function(dataArray) {
	this.width = dataArray[0].length;
	this.height = dataArray.length;
	
	this.map = dataArray;
};


LoresPixmap.prototype.getWidth = function() {
	return this.width;
};


LoresPixmap.prototype.getHeight = function() {
	return this.height;
};


LoresPixmap.prototype.drawMap = function(otherMap, x, y) {
	
	for(var yy = 0; yy < otherMap.getHeight(); yy++) {
		for(var xx = 0; xx < otherMap.getWidth(); xx++) {
			
			var color = otherMap.getPixel(xx,yy);
			if(color == -1) continue; // transparent = no draw
			this.setPixel(x+xx, y+yy, color);
			
		}
	}
};


LoresPixmap.prototype.eraseMap = function(otherMap, x, y) {
		
	for(var yy = 0; yy < otherMap.getHeight(); yy++) {
		for(var xx = 0; xx < otherMap.getWidth(); xx++) {
			
			var color = otherMap.getPixel(xx,yy);
			if(color == -1) continue; // transparent = no draw
			this.setPixel(x+xx, y+yy, this.bg);
			
		}
	}
};


LoresPixmap.prototype.eraseRect = function(x, y, w, h) {
	
	for(var yy = 0; yy < h; yy++) {
		for(var xx = 0; xx < w; xx++) {
			
			this.setPixel(x+xx, y+yy, this.bg);
		}
	}
};


LoresPixmap.prototype.fillRect = function(x, y, w, h, color) {
	
	for(var yy = 0; yy < h; yy++) {
		for(var xx = 0; xx < w; xx++) {
			
			this.setPixel(x+xx, y+yy, color);
		}
	}
};


LoresPixmap.prototype.flush = function() {
	if(this.connectedDisplay == null) {
		throw "Cannot flush map without a connected display.";
	}
	
	this.connectedDisplay.drawMap(this, 0, 0);
};


LoresPixmap.prototype.autoFlush = function(state) {
	this.doAutoFlush = state;
};




/* Color filter
 * 
 * Used to translate color codes when
 * writing from a pixmap to display
 */
function LoresColorFilter(translations) {
	this.table = translations || {};
}


LoresColorFilter.prototype.process = function(color) {
	color = (this.table[color] !== undefined) ? this.table[color] : color;
	return color;
};


LoresColorFilter.prototype.addFilter = function(from, to) {
	this.table[from] = to;
};


LoresColorFilter.prototype.removeFilter = function(color) {
	delete this.table[from];
};




/* Keyboard input handler */
function LoresKeyboard() {
	
	this.states = {};

	this.pressHandlers = {};
	this.downHandlers = {};
	this.upHandlers = {};
	
	var self = this;

	$(window).on("keydown", function(event) {
		self.states[event.which] = true;
		self.downHandlers[event.which] && self.downHandlers[event.which](event.which);
	});
	
	$(window).on("keyup", function(event) {
		self.states[event.which] = false;
		self.upHandlers[event.which] && self.upHandlers[event.which](event.which);
	});
	
	$(window).on("keypress", function(event) {
		self.pressHandlers[event.which] && self.pressHandlers[event.which](event.which);
	});
	
};

LoresKeyboard.DELETE = 46;
LoresKeyboard.BACKSPACE = 8;
LoresKeyboard.SPACE = 32;
LoresKeyboard.ENTER = 13;
LoresKeyboard.ESC = 27;

LoresKeyboard.LEFT = 37;
LoresKeyboard.RIGHT = 39;
LoresKeyboard.UP = 38;
LoresKeyboard.DOWN = 40;

LoresKeyboard.CTRL = 17;
LoresKeyboard.SHIFT = 16;
LoresKeyboard.META = 91;
LoresKeyboard.INSERT = 45;
LoresKeyboard.PAGEUP = 33;
LoresKeyboard.PAGEDOWN = 34;
LoresKeyboard.HOME = 36;
LoresKeyboard.END = 35;

LoresKeyboard.A = 65;
LoresKeyboard.B = 66;
LoresKeyboard.C = 67;
LoresKeyboard.D = 68;
LoresKeyboard.E = 69;
LoresKeyboard.F = 70;
LoresKeyboard.G = 71;
LoresKeyboard.H = 72;
LoresKeyboard.I = 73;
LoresKeyboard.J = 74;
LoresKeyboard.K = 75;
LoresKeyboard.L = 76;
LoresKeyboard.M = 77;
LoresKeyboard.N = 78;
LoresKeyboard.O = 79;
LoresKeyboard.P = 80;
LoresKeyboard.Q = 81;
LoresKeyboard.R = 82;
LoresKeyboard.S = 83;
LoresKeyboard.T = 84;
LoresKeyboard.U = 85;
LoresKeyboard.V = 86;
LoresKeyboard.W = 87;
LoresKeyboard.X = 88;
LoresKeyboard.Y = 89;
LoresKeyboard.Z = 90;

LoresKeyboard.NUM_0 = 96;
LoresKeyboard.NUM_1 = 97;
LoresKeyboard.NUM_2 = 98;
LoresKeyboard.NUM_3 = 99;
LoresKeyboard.NUM_4 = 100;
LoresKeyboard.NUM_5 = 101;
LoresKeyboard.NUM_6 = 102;
LoresKeyboard.NUM_7 = 103;
LoresKeyboard.NUM_8 = 104;
LoresKeyboard.NUM_9 = 105;

LoresKeyboard.LETTERS = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90];
LoresKeyboard.ASDW = [65,83,68,87];
LoresKeyboard.ARROWS = [37,38,39,40];
LoresKeyboard.NUMBERS = [96,97,98,99,100,101,102,103,104,105];



LoresKeyboard.prototype.isDown = function(keycode) {
	var val = this.states[keycode];
	if(val == undefined) val = false;
	return val;
};


LoresKeyboard.prototype.resetKeys = function() {
	this.states = {};
};


LoresKeyboard.prototype.setPressHandler = function(keycode, handler) {
	
	if(keycode.constructor == Array) {
		
		for(var i=0; i<keycode.length; i++) {
			this.pressHandlers[ keycode[i] ] = handler;
		}
		
	} else {
		
		this.pressHandlers[keycode] = handler;
		
	}
	
};


LoresKeyboard.prototype.setDownHandler = function(keycode, handler) {
	
	if(keycode.constructor == Array) {
		
		for(var i=0; i<keycode.length; i++) {
			this.downHandlers[ keycode[i] ] = handler;
		}
		
	} else {
		
		this.downHandlers[keycode] = handler;
		
	}
	
};


LoresKeyboard.prototype.setUpHandler = function(keycode, handler) {
	
	if(keycode.constructor == Array) {
		
		for(var i=0; i<keycode.length; i++) {
			this.upHandlers[ keycode[i] ] = handler;
		}
		
	} else {
		
		this.upHandlers[keycode] = handler;
		
	}
	
};


LoresKeyboard.prototype.removePressHandler = function(keycode) {
	delete this.pressHandlers[keycode];
};


LoresKeyboard.prototype.removeDownHandler = function(keycode) {
	delete this.downHandlers[keycode];
};


LoresKeyboard.prototype.removeUpHandler = function(keycode) {
	delete this.upHandlers[keycode];
};




// INCLUDED SHIM FOR requestAnimationFrame
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
								|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
