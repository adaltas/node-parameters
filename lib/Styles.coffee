
colors =
    black: 30
    red: 31
    green: 32
    yellow: 33
    blue: 34
    magenta: 35
    cyan: 36
    white: 37

bgcolors =
    black: 40
    red: 41
    green: 42
    yellow: 43
    blue: 44
    magenta: 45
    cyan: 46
    white: 47

module.exports = Styles = (settings = {}) ->
    if this not instanceof Styles
        return new Styles settings
    this.settings = settings
    this.settings.stdout = settings.stdout ? process.stdout
    # Current state
    this.current =
        weight: 'regular'
    # Export colors
    this.colors = colors
    this.bgcolors = bgcolors
    this

# Color
Styles.prototype.color = (color, text) ->
    this.print text, {color: color}
    if not text
        # Save state if no text
        this.current.color = color
    this

for color, code of colors
    do (color) ->
        Styles.prototype[color] = (text) ->
            this.color color, text

Styles.prototype.nocolor = (text) ->
    this.color null, text

# bgcolor
Styles.prototype.bgcolor = (bgcolor) ->
    bgcolor ?= 0
    this.print '\x1B[' + bgcolor + ';m39'
    this

# Font weight
Styles.prototype.weight = (weight, text) ->
    this.print text, {weight: weight}
    if not text
        # Save state if no text
        this.current.weight = weight
    this

Styles.prototype.bold = (text) ->
    this.weight 'bold', text

Styles.prototype.regular = (text) ->
    this.weight 'regular', text

# Print

Styles.prototype.print = (text, settings) ->
    this.settings.stdout.write this.raw(text, settings)
    this

Styles.prototype.println = (text) ->
    this.settings.stdout.write text + '\n'
    this

Styles.prototype.ln = ->
    this.settings.stdout.write '\n'
    this

# Others

Styles.prototype.raw = (text, settings) ->
    raw = '';
    settings ?= {}
    if settings.color isnt null and ( settings.color or this.current.color )
        raw += '\x1b[' + this.colors[settings.color or this.current.color] + 'm'
    else
        raw += '\x1b[39m'
    switch settings.weight or this.current.weight
        when 'bold'
            raw += '\x1b[1m'
        when 'regular'
            raw += '\x1b[22m'
        else
            throw new Error 'Invalid weight "' + weight + '" (expect "bold" or "regular")'
    if text
        # Print text if any
        raw += text
        # Restore state if any
        if this.current.color and this.current.color isnt settings.color
            raw += this.raw null, this.current.color
        if this.current.weight and this.current.weight isnt settings.weight
            raw += this.raw null, this.current.weight
    raw

Styles.prototype.reset = (text) ->
    this.print null,
        color: null
        weight: 'regular'
