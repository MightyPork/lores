// Lores.js - sprites module
// (c) Ondrej Hruska 2013
// www.ondrovo.com

// MIT license


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