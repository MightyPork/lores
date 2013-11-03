// Lores.js
// (c) Ondrej Hruska 2013
// www.ondrovo.com | @MightyPork | ondra@ondrovo.com

// MIT license


/* ====== CORE ====== */

Lores = {
	version: "0.1",    // library version
	verbose: true,     // enable debug output to console
};


/* ====== DISPLAY ====== */
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
	
	options.colorTranslator = options.colorTranslator || new LoresColorTranslator();
	
	this.colors = options.colors;
	this.colorTranslator = options.colorTranslator;
	
	this.width = options.width;
	this.height = options.height;

	this.rows = options.rows;
	this.cols = options.cols;
	
	this.pixelWidth = (this.width/this.cols);
	this.pixelHeight = (this.height/this.rows);

	this.bg = options.bg;
	this.fg = options.fg;
	
	
	// build a canvas
	
	this.canvas = $('<canvas/>')
		.css({position: "absolute", left: 0, top: 0})
		.attr({"width": this.width, "height": this.height})
		.appendTo(this.wrapper);
	
	this.context = this.canvas[0].getContext('2d');
	
	this.erase(true);
	
	
	// mouse input
	
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
		
			self.rawMoveHandler(pixel, self.lastMousePosRaw, self);
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


LoresDisplay.prototype.eraseRect = function(x1,y1,w,h,fillWithBg) {

	if(fillWithBg) {
		this.fillRect(x1,y1,x2,y2,this.bg);
	} else {
		this.context.clearRect(
			x1 * this.pixelWidth,
			y1 * this.pixelHeight,
			w * this.pixelWidth,
			h * this.pixelHeight
		);
	}
};


LoresDisplay.prototype.fillRect = function(x1,y1,w,h,color) {

	color = this.resolveColor(color);
	
	if(color == -1) {
		color = this.resolveColor(this.bg);
	}	
	
	if(color == -1) {
		this.eraseRect(x1,y1,w,h,false);
	} else {
		this.context.fillStyle = color;
		this.context.fillRect(
			x1 * this.pixelWidth,
			y1 * this.pixelHeight,
			w * this.pixelWidth,
			h * this.pixelHeight
		);
	}
};


LoresDisplay.prototype.getCanvas = function() {
	return this.canvas[0];
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


LoresDisplay.prototype.getColorTranslator = function() {
	return this.colorTranslator;
};


LoresDisplay.prototype.setColorTranslator = function(newTranslator) {
	this.colorTranslator = newTranslator;
};


LoresDisplay.prototype.setColorReplacementTable = function(newTable) {
	this.colorTranslator.setRules(newTable);
};


LoresDisplay.prototype.addColorRule = function(from, to) {
	this.colorTranslator.addRule(from, to);
};


LoresDisplay.prototype.removeColorRule = function(color) {
	this.colorTranslator.removeRule(color);
};


LoresDisplay.prototype.setColorFilter = function(filterFunction) {
	this.colorTranslator.setFilter(filterFunction);
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
	
	color = this.colorTranslator.process(color);
	
	
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
	
	if(x<0||x>=this.cols||y<0||y>=this.rows) return; // out of bounds
	
	
	color = this.resolveColor(color);
	
	if(color == -1 && this.bg != -1) {
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


LoresDisplay.prototype.getMap = function(fill) {
	if(fill === undefined) fill = this.bg;
	var map = new LoresPixmap(this.cols, this.rows, fill);
	map.connectedDisplay = this;
	return map;
};



/* ====== PALETTE ====== */

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



/* ====== PIXMAP ====== */

function LoresPixmap(width, height, fill) {
	
	this.doAutoFlush = true;
	this.connectedDisplay = null;
	if(fill == undefined) fill = -1;
	this.bg = fill;
	this.ready = false;
	
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
	
	this.ready = true;
}


LoresPixmap.fromArray = function(array){
	var pm = new LoresPixmap();
	pm.setArray(array);
	return pm;
};


// rows divided by , or | or \n
// traditional
LoresPixmap.fromString = function(string, colors){
	var pm = new LoresPixmap();
	
	var array = [];
		
	var strRows = string.split(/[,\n|]/g);
		
	var lastRowLen = -1;
	
	outer:
	for(var y=0; y<strRows.length; y++) {
		
		if(strRows[y].length==0) continue;
		
		var row = [];
		for(var x=0; x<strRows[y].length; x++) {
			
			var char = strRows[y].charAt(x);
			
			if(char == undefined) break outer; // out of data
			
			var color = colors[char];
			
			if(color === undefined) color = -1;
			
			row.push(color);
		}
		
		if(lastRowLen!=-1 && lastRowLen!=row.length) {
			throw "Uneven rows in pixmap source (last: " + lastRowLen + ", this: " + row.length+")";
		}
		lastRowLen = row.length;
		
		array.push(row);
	}
	
	pm.setArray(array);
	return pm;
};


LoresPixmap.fromStringXpm = function(xpm){
	
	var pm = new LoresPixmap();
	pm.setArray(LoresPixmap._arrayFromStringXpm(xpm));
	return pm;
};


LoresPixmap._arrayFromStringXpm = function(xpm){
	
	var array = [];
	
	var w, h, cc, cpp;
	
	var colors = {};
	
	var lines = xpm.split('\n');
	
	var validLineIndex = 0;
	for(var l=0; l<lines.length; l++) {
		var line = lines[l];
		
		if(line.match(/^".*?".*$/g)) {
			line = /^"(.*?)".*$/g.exec(line)[1];
			
			var valid = false;
			if(validLineIndex==0) {
				// w h cc cpp
				var parts = line.split(/\s/g);
				w = 1*parts[0];
				h = 1*parts[1];
				cc = 1*parts[2];
				cpp = 1*parts[3];
				valid = true;
				
			} else if(validLineIndex >= 1 && validLineIndex <= cc) {
				// key c color
				var key = line.substring(0, cpp);
				
				var parts = line.substring(cpp).trim().split(/\s/g);
				if(parts[0]=='c') {
					var color = parts[1];
					
					colors[key] = color;
				} else {
					throw "Invalid color definition: " + line;
				}
				
				
				valid = true;
				
			} else if(line.length == w * cpp) {
				
				// an actual line
				valid = true;
				
				var row = [];
				
				for(var pi = 0; pi < w; pi++) {
					var c = line.substring(pi*cpp, (pi+1)*cpp);
			
					var color = colors[c];
			
					if(color === undefined) color = -1;
			
					row.push(color);
				}

				array.push(row);
				
			} else {
				throw "Invalid img data: " + line;
			}
			
			if(valid) validLineIndex++;
		}
	}
	
	return array;
};


LoresPixmap.prototype.setReady = function() {
	this.ready = true;
};


LoresPixmap.prototype.isReady = function() {
	return this.ready;
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
	
	this.setReady(true);
	
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


LoresPixmap.prototype.checker = function(base, color) {
	
	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			this.setPixel(x, y, ((x+y)%2==0 ? color : base));
		}
	}
};


LoresPixmap.prototype.walk = function(walker) {
	
	for(var y = 0; y < this.height; y++) {
		for(var x = 0; x < this.width; x++) {
			walker(x, y, this);
		}
	}
};



/* ====== COLOR TRANSLATOR ====== */

// Used to translate color codes when writing from a pixmap to display
function LoresColorTranslator(rules) {
	this.table = rules || {};
	this.filter = function(color) {return color};
}


LoresColorTranslator.prototype.process = function(color) {
	color = (this.table[color] !== undefined) ? this.table[color] : color;
	
	return this.filter(color);
};


LoresColorTranslator.prototype.addRule = function(from, to) {
	this.table[from] = to;
};


LoresColorTranslator.prototype.removeRule = function(color) {
	delete this.table[from];
};


LoresColorTranslator.prototype.setRules = function(rules) {
	this.table = rules;
};


LoresColorTranslator.prototype.setFilter = function(filterFunction) {
	this.filter = filterFunction;
};



/* ====== KEYBOARD ====== */

function LoresKeyboard() {
	
	this.states = {};

	this.pressHandlers = {};
	this.downHandlers = {};
	this.upHandlers = {};
	
	var self = this;

	$(window).on("keydown", function(event) {
		self.states[event.which] = true;
		self.downHandlers[event.which] && self.downHandlers[event.which](event.which);
		self.downHandlers[ -1 ] && self.downHandlers[ -1 ](event.which);
	});
	
	$(window).on("keyup", function(event) {
		self.states[event.which] = false;
		self.upHandlers[event.which] && self.upHandlers[event.which](event.which);
		self.upHandlers[ -1 ] && self.upHandlers[ -1 ](event.which);
	});
	
	$(window).on("keypress", function(event) {
		self.pressHandlers[event.which] && self.pressHandlers[event.which](event.which);
		self.pressHandlers[ -1 ] && self.pressHandlers[ -1 ](event.which);
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

// for the lazy bums
LKey = LoresKeyboard;


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
		
	} else if(typeof keycode === "function" && handler === undefined) {
		
		this.pressHandlers[ -1 ] = keycode; // default handler, no keycode
		
	} else {
		
		this.pressHandlers[keycode] = handler;
		
	}
	
};


LoresKeyboard.prototype.setDownHandler = function(keycode, handler) {
	
	if(keycode.constructor == Array) {
		
		for(var i=0; i<keycode.length; i++) {
			this.downHandlers[ keycode[i] ] = handler;
		}
		
	} else if(typeof keycode === "function" && handler === undefined) {
		
		this.downHandlers[ -1 ] = keycode; // default handler, no keycode
		
	}  else {
		
		this.downHandlers[keycode] = handler;
		
	}
	
};


LoresKeyboard.prototype.setUpHandler = function(keycode, handler) {
	
	if(keycode.constructor == Array) {
		
		for(var i=0; i<keycode.length; i++) {
			this.upHandlers[ keycode[i] ] = handler;
		}
		
	} else if(typeof keycode === "function" && handler === undefined) {
		
		this.upHandlers[ -1 ] = keycode; // default handler, no keycode
		
	}  else {
		
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



/* ====== DOWNLOADER ====== */

function LoresDownloader() {
	this.done = false;
	
	this.list = [];
	this.queued = 0;
}


LoresDownloader.prototype.getXpm = function(url, handler) {
	this._getFile(url, "xpm", handler);
};


LoresDownloader.prototype.getText = function(url, handler) {
	this._getFile(url, "text", handler);
};


// handler(resultData, downloadInfoObject)
LoresDownloader.prototype._getFile = function(url, type, handler) {
	this.list.push({
		url: url,
		type: type,
		handler: handler,
		done: false,
		data: null,
	});
	
	this.queued++;
};


// start the fun
LoresDownloader.prototype.run = function(readyFn) {
	
	this.done = false;
	
	var self = this;
	
	for(var i = 0; i < this.list.length; i++) {
		var dl = this.list[i];
		
		Lores.verbose && console.log("GET " + dl.url);
		
		if(dl.done) continue;
		
		$.get(dl.url, self._makeDlHandler(dl, readyFn), "text");
	}
	
};


LoresDownloader.prototype._makeDlHandler = function(dl, handlerAll) {
	
	var self = this;
	
	return function(data) {
		Lores.verbose && console.log("GOT " + dl.url);
		
		dl.done = true;
		
		// process
		switch(dl.type) {
			case "xpm":
				var pm = LoresPixmap.fromStringXpm(data);
				
				dl.data = pm;
				dl.handler && dl.handler(pm, dl);
				break;
				
			case "text":
			default:
				dl.data = data;
				dl.handler && dl.handler(data, dl);
				break;
		}
		
		self.queued--;
		if(self.queued == 0) {
			self.done = true;
			handlerAll && handlerAll();
		}
	};
	
};



/* ====== ANIMATOR ====== */

function LoresAnimator(opts) {
	this.initAnim = opts.init || function(){};
	this.animFrame = opts.frame || function(){};
	this.fps = opts.fps || 40;
	
	this.started = false;
	this.paused = false;
	this.halted = false;
};


LoresAnimator.prototype.start = function() {	
	this.initAnim();
	
	this.started = true;
	this.paused = false;
	this.halted = false;
	
    this._requestFrame();
};


LoresAnimator.prototype.stop = function() {
	var self = this;
	
	this.started = false;
	this.halted = true;
};


LoresAnimator.prototype.isPaused = function() {
	return this.started && this.paused && !this.halted;
};


LoresAnimator.prototype.isRunning = function() {
	return this.started && !this.paused && !this.halted;
};


LoresAnimator.prototype.toggle = function() {
	var self = this;
	
	if(!this.started || this.halted) {
		throw "Invalid state for toggle()";
	}
	
	if(this.paused) {
		this.resume();
	} else {
		this.pause();
	}
};


LoresAnimator.prototype.pause = function() {
	var self = this;
	
	if(!this.started || this.halted) {
		throw "Invalid state for pause()";
	}
	
	this.paused = true;
	this.halted = false;
};


LoresAnimator.prototype.setFps = function(fps) {
	
	this.fps = fps;
};


LoresAnimator.prototype.resume = function() {
	var self = this;
	
	if(!this.started || !this.paused || this.halted) {
		throw "Invalid state for resume()";
	}
	
	this.paused = false;
	this.halted = false;
	
    this._requestFrame();
};


LoresAnimator.prototype.step = function(timestamp) {
	var self = this;
	
	if(!this.started) {
		//throw "Invalid state for step()";
		return; // ignore
	}
	
	if(this.halted || this.paused) return;
	
	setTimeout(function() {
        self._requestFrame();
        self.animFrame(timestamp);
    }, 1000 / self.fps);
};


LoresAnimator.prototype._requestFrame = function() {
	
	if(this.halted || this.paused) return;
	
	var self = this;
	window.requestAnimationFrame(function(time){self.step(time)});
};



/* ====== SPRITE POOL ====== */

function LoresSpritePool(map) {
	this.drawingMap = map || null;
	this.sprites = [];
}


LoresSpritePool.prototype.setMap = function(map) {
	this.drawingMap = map;
};


LoresSpritePool.prototype.addSprite = function(sprite) {
	if(this.hasSprite(sprite)) return; // no work to do
	this.sprites.push(sprite);
	this.sortSprites(); // sort them
};

LoresSpritePool.prototype.hasSprite = function(sprite) {
	for(var i in this.sprites) {
		if(this.sprites[i] === sprite) {
			return true;
		}
	}
	return false;
};


LoresSpritePool.prototype.removeSprite = function(sprite) {
	for (var i = this.sprites.length - 1; i >= 0; i--) {
		if (this.sprites[i] == sprite) this.sprites.splice(i, 1);
	}
};


LoresSpritePool.prototype.getSprites = function() {
	return this.sprites;
};


LoresSpritePool.prototype.getColliding = function(sprite, pixelPerfect) {
	var results = [];
	for(var i in this.sprites) {
		var spr = this.sprites[i];
		if(spr === sprite) continue;
		if(spr.collidesWith(sprite, pixelPerfect)) {
			results.push(spr);
		}
	}
	return results;
};


LoresSpritePool.prototype.eraseMap = function() {
	if(this.drawingMap == undefined) throw "LoresSpritePool has no map.";
	
	this.drawingMap.erase();
};


LoresSpritePool.prototype.drawOnMap = function() {
	if(this.drawingMap == undefined) throw "LoresSpritePool has no map.";
	
	for(var i in this.sprites) {
		this.sprites[i].drawOnMap(this.drawingMap);
	}
};


LoresSpritePool.prototype.eraseOnMap = function(perPixel) {
	if(this.drawingMap == undefined) throw "LoresSpritePool has no map.";
		
	for(var i in this.sprites) {
		this.sprites[i].eraseOnMap(this.drawingMap, perPixel);
	}
};


LoresSpritePool.prototype.sortSprites = function() {
	this.sprites.sort(function(a,b) {
		return (a.z > b.z) ? -1 : ((b.z > a.z) ? 1 : 0);
	});
};


LoresSpritePool.prototype.moveSprites = function() {
	for(var i in this.sprites) {
		this.sprites[i].doMove();
	}
};



/* ====== SPRITE ====== */

function LoresSprite(opts) {
	this.map = opts.map;
	
	this.x = opts.x;
	this.y = opts.y;
	
	this.newx = opts.x;
	this.newy = opts.y;
	
	this.z = (opts.z === undefined ? 0 : opts.z); // z-index
}


LoresSprite.prototype.setMap = function(map) {
	this.map = map;
};


LoresSprite.prototype.setPosition = function(xpos, ypos) {
	this.newx = xpos;
	this.newy = ypos;
};


LoresSprite.prototype.scheduleMove = function(xoffset, yoffset) {
	this.newx = this.x + xoffset;
	this.newy = this.y + yoffset;
};


LoresSprite.prototype.doMove = function() {
	this.x = this.newx;
	this.y = this.newy;
};


LoresSprite.prototype.getWidth = function() {
	return this.map.getWidth();
};


LoresSprite.prototype.getHeight = function() {
	return this.map.getHeight();
};


LoresSprite.prototype.collidesWith = function(other, pixelPerfect) {
	var x1L = this.x;
	var x1R = this.x + this.getWidth() - 1;
	var y1U = this.y;
	var y1D = this.y + this.getHeight() - 1;
	
	var x2L = other.x;
	var x2R = other.x + other.getWidth() - 1;
	var y2U = other.y;
	var y2D = other.y + other.getHeight() - 1;
	
	var horizontal = x1L >= x2L && x1L <= x2R;
	horizontal |= x1R <= x2R && x1R >= x2L;
	
	var vertical = y1U >= y2U && y1U <= y2D;
	vertical |= y1D <= y2D && y1D >= y2U;
	
	var rectCollides = (horizontal && vertical);
	
	if(!rectCollides) return false; // surely
	
	if(!pixelPerfect) {
		return true; // rect collision suffices
		
	} else {
		
		for(var yy = Math.max(y1U, y2U); yy <= Math.min(y1D, y2D); yy++) {
			for(var xx = Math.max(x1L, x2L); xx <= Math.min(x1R, x2R); xx++) {
				
				var c1 = this.map.getPixel( (xx - x1L), (yy - y1U) );
				var c2 = other.map.getPixel( (xx - x2L), (yy - y2U) );
				
				if(c1 != -1 && c2 != -1) return true; // collision detected
			}
		}
		
		return false; // nope
	}
};


LoresSprite.prototype.drawOnMap = function(map) {
	map.drawMap(this.map, this.x, this.y);
};


LoresSprite.prototype.eraseOnMap = function(map, perPixel) {
	if(perPixel) {
		map.eraseMap(this.map, this.x, this.y);
	} else {
		map.eraseRect(this.x, this.y, this.map.getWidth(), this.map.getHeight());
	}
};



/* ====== TILE SET ====== */

function LoresTileset(helperDisplay, tileWidth, tileHeight) {
	this.display = helperDisplay || null;
	this.tiles = {};
	this.w = tileWidth;
	this.h = tileHeight;
	this.lastX = -this.w;
	this.lastY = 0; 
}


LoresTileset.prototype.erase = function() {
	this.display.erase(true);
};


LoresTileset.prototype.addTile = function(name, pixmap) {
	
	if(pixmap.getWidth() != this.w && pixmap.getHeight() != this.h) {
		throw "Tile size not compatible with tileset.";
	}
	
	var x = this.lastX + this.w;
	var y = this.lastY;
	
	var maxX = x + this.w;
	var maxY = y + this.h;
	
	if(maxX >= this.display.getWidth()) {
		x = 0;
		y += this.h;
	}
	
	if(maxY >= this.display.getHeight()) {
		throw "Tileset is full, can't add another tile.";
	}
	
	this.tiles[name] = {x:x,y:y};
	
	this.lastX = x;
	this.lastY = y;
	
	Lores.verbose && console.log("new tile at "+x+","+y);
	
	this.display.drawMap(pixmap, x, y);
};


LoresTileset.prototype.renderTile = function(dest, name, x, y) {
	var source = this.display.getCanvas();
	var ctx = dest.getContext();
	
	var tile = this.tiles[name];
	
	if(tile===undefined) throw "Tile not found: " + name;
	
	var px = dest.getPixelSize();
	var px2 = this.display.getPixelSize();
	
	if(px.x != px2.x || px.y != px2.y) throw "Tileset's pixel size doesn't match target pixel size. Can't draw.";
	
	ctx.drawImage(
		source,
		
		tile.x*px.x,
		tile.y*px.y,
		this.w*px.x,
		this.h*px.y,
		
		x*this.w*px.x,
		y*this.w*px.y,
		this.w*px.x,
		this.h*px.y
	);
};



/* ====== UTILS ====== */

Lores.buildCheckerBackground = function(element, bgCols, bgRows, bg, fg) {
	var scr = new LoresDisplay(
		$(element),
		{
			cols: bgCols,
			rows: bgRows,
			colors: {
				0: bg || "#000",
				1: fg || "#111",
			},
			bg: 0,
		}
	);
	
	var map = scr.getMap();
	map.autoFlush(false);
	map.checker(0,1);
	map.flush();
};


Lores.buildHelperCanvas = function(element, cols, rows, palette, bg) {
	var scr = new LoresDisplay(
		$(element),
		{
			cols: cols,
			rows: rows,
			colors: palette,
			bg: (bg===undefined ? -1 : bg),
		}
	);
	
	$(scr.getCanvas()).css("display","none");
	
	return scr;
};


Lores.shuffleArray = function(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
};



/* ====== THIRD PARTY ====== */

// Shim for requestAnimationFrame
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
