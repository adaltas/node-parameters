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

var Styles = function(settings){
    if (!(this instanceof Styles)) {
        return new Styles(settings);
    }
    this.settings = settings || {};
    this.settings.stdout = this.settings.stdout || process.stdout;
    // Current state
    this.current = {
        weight: 'regular',
        //color: null
    }
    // Export colors
    this.colors = colors;
    this.bgcolors = bgcolors;
};

// Color
Styles.prototype.color = function(color, text) {
    this.print(text, {color: color});
    if(!text){
        // Save state if no text
        this.current.color = color;
    }
    return this;
}

Object.keys(colors).forEach(function(color){
    Styles.prototype[color] = function(text){
        return this.color(color, text);
    }
}.bind(this));

Styles.prototype.nocolor = function(text){
    return this.color(null, text);
}

// bgcolor
Styles.prototype.bgcolor = function(bgcolor){
    bgcolor = bgcolor || 0;
    this.print('\x1B['+bgcolor+';m39');
    return this;
}

// Font weight
Styles.prototype.weight = function(weight, text){
        this.print(text, {weight: weight});
        if(!text){
            // Save state if no text
            this.current.weight = weight;
        }
        return this;
    }

Styles.prototype.bold = function(text){
        return this.weight('bold', text);
    }

Styles.prototype.regular = function(text){
        return this.weight('regular', text);
    }

// Print
Styles.prototype.print = function(text, settings){
        this.settings.stdout.write(this.raw(text, settings));
        return this;
    }

Styles.prototype.println = function(text){
        this.settings.stdout.write(text+'\n');
        return this;
    }
Styles.prototype.ln = function(){
        this.settings.stdout.write('\n');
        return this;
    }

// Others

Styles.prototype.raw = function(text, settings){
        var raw = '';
        settings = settings || {};
        if(settings.color !== null && ( settings.color || this.current.color) ){
            raw += '\x1b['+this.colors[settings.color || this.current.color]+'m';
        }else{
            raw += '\x1b[39m';
        }
        switch(settings.weight || this.current.weight){
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
            if(this.current.color && this.current.color != settings.color){
                raw += this.raw(null, this.current.color);
            }
            if(this.current.weight && this.current.weight != settings.weight){
                raw += this.raw(null, this.current.weight);
            }
        }
        return raw;
    }

Styles.prototype.reset = function(text){
        return this.print(null,{
            color: null,
            weight: 'regular'
        });
    }

module.exports = Styles;