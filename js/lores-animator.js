// Lores.js - animator module
// (c) Ondrej Hruska 2013
// www.ondrovo.com

// MIT license


/* Animation manager */
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
		throw "Invalid state for step()";
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

