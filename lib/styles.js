var sys = require('sys');

var colors = {
	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37
};
var bgcolors = {
	black: 40,
	red: 41,
	green: 42,
	yellow: 43,
	blue: 44,
	magenta: 45,
	cyan: 46,
	white: 47,
};
module.exports = function(){
	// Current state
	this.current = {
		weight: 'regular',
		//color: null
	}
	// Export colors codes
	this.colors = colors;
	this.bgcolors = bgcolors;
	// Color
	this.color = function(color, text) {
		this.print(text, {color: color});
		if(text){
			// Restore state if any
			/*
			if(this.current.color && this.current.color != color){
				this.color(this.current.color);
			}
			*/
		}else{
			// Save state if no text
			this.current.color = color;
		}
		return this;
	}
	Object.keys(colors).forEach(function(color){
		this[color] = function(text){
			return this.color(color, text);
		}
	}.bind(this));
	this.nocolor = function(text){
		return this.color(null, text);
	}
	this.bgcolor = function(bgcolor){
		bgcolor = bgcolor || 0;
		sys.print('\x1B['+bgcolor+';m39');
		return this;
	}
	// Font weight
	this.weight = function(weight, text){
		this.print(text, {weight: weight});
		if(text){
			/*
			// Restore state if any
			if(this.current.weight && this.current.weight != weight){
				this.weight(this.current.weight);
			}
			*/
		}else{
			// Save state if no text
			this.current.weight = weight;
		}
		return this;
	}
	this.bold = function(text){
		return this.weight('bold', text);
	}
	this.regular = function(text){
		return this.weight('regular', text);
	}
	// Print
	this.print = function(text, options){
		sys.print(this.raw(text, options));
		return this;
	}
	this.println = function(text){
		sys.print(text+'\n');
		return this;
	}
	this.ln = function(text){
		sys.print('\n');
		return this;
	}
	// Others
	this.raw = function(text, options){
		var raw = '';
		options = options || {};
		/*
		for(var k in this.current){
			if(!options[k]){
				options[k] = this.current[k];
			}
		}
		*/
		if(options.color !== null && ( options.color || this.current.color) ){
			raw += '\x1b['+this.colors[options.color || this.current.color]+'m';
		}else{
			raw += '\x1b[39m';
		}
		switch(options.weight || this.current.weight){
			case 'bold':
				raw += '\x1b[1m';
			break;
			case 'regular':
				raw += '\x1b[22m';
			break;
			default:
				throw new Error('Invalid weight "'+weight+'" (expect "bold" or "regular")');
		}
		if(text){
			// Print text if any
			raw += text;
			// Restore state if any
			if(this.current.color && this.current.color != options.color){
				raw += this.raw(null, this.current.color);
			}
			if(this.current.weight && this.current.weight != options.weight){
				raw += this.raw(null, this.current.weight);
			}
		}
		return raw;
	}
	this.reset = function(text){
		return this.print(null,{
			color: null,
			weight: 'regular'
		});
	}
	return this;
};