var Color = (function () {

    /**
     * Representation of RGBA colors.
     *
     * Each color component is a floating point value with a range from 0 to 1.
     *
     * You can also use the convenience method <% crosslink Fire.color Fire.color %> to create a new Color.
     *
     * @class Color
     * @extends ValueType
     * @constructor
     * @param {number} [r=0] - red component of the color
     * @param {number} [g=0] - green component of the color
     * @param {number} [b=0] - blue component of the color
     * @param {number} [a=1] - alpha component of the color
     */
    function Color( r, g, b, a ) {
        this.r = typeof r === 'number' ? r : 0.0;
        this.g = typeof g === 'number' ? g : 0.0;
        this.b = typeof b === 'number' ? b : 0.0;
        this.a = typeof a === 'number' ? a : 1.0;
    }
    JS.extend(Color, ValueType);
    Fire._fastDefine('Fire.Color', Color, ['r', 'g', 'b', 'a']);

    var DefaultColors = {
        // color: [r, g, b, a]
        /**
         * @property white
         * @type Color
         * @static
         */
        white:      [1, 1, 1, 1],
        /**
         * @property black
         * @type Color
         * @static
         */
        black:      [0, 0, 0, 1],
        /**
         * @property transparent
         * @type Color
         * @static
         */
        transparent:[0, 0, 0, 0],
        /**
         * @property gray
         * @type Color
         * @static
         */
        gray:       [0.5, 0.5, 0.5],
        /**
         * @property red
         * @type Color
         * @static
         */
        red:        [1, 0, 0],
        /**
         * @property green
         * @type Color
         * @static
         */
        green:      [0, 1, 0],
        /**
         * @property blue
         * @type Color
         * @static
         */
        blue:       [0, 0, 1],
        /**
         * @property yellow
         * @type Color
         * @static
         */
        yellow:     [1, 235/255, 4/255],
        /**
         * @property cyan
         * @type Color
         * @static
         */
        cyan:       [0, 1, 1],
        /**
         * @property magenta
         * @type Color
         * @static
         */
        magenta:    [1, 0, 1]
    };
    for (var colorName in DefaultColors) {
        var colorGetter = (function (r, g, b, a) {
            return function () {
                return new Color(r, g, b, a);
            };
        }).apply(null, DefaultColors[colorName]);
        Object.defineProperty(Color, colorName, { get: colorGetter });
    }

    /**
     * Clone a new color from the current color.
     * @method clone
     * @return {Color} Newly created color.
     */
    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b, this.a);
    };

    /**
     * @method equals
     * @param {Color} other
     * @return {boolean}
     */
    Color.prototype.equals = function (other) {
        return other &&
               this.r === other.r &&
               this.g === other.g &&
               this.b === other.b &&
               this.a === other.a;
    };

    /**
     * @method lerp
     * @param {Color} to
     * @param {number} ratio - the interpolation coefficient
     * @param {Color} [out] - optional, the receiving vector
     * @return {Color}
     */
    Color.prototype.lerp = function (to, ratio, out) {
        out = out || new Color();
        var r = this.r;
        var g = this.g;
        var b = this.b;
        var a = this.a;
        out.r = r + (to.r - r) * ratio;
        out.g = g + (to.g - g) * ratio;
        out.b = b + (to.b - b) * ratio;
        out.a = a + (to.a - a) * ratio;
        return out;
    };

    /**
     * @method toString
     * @return {string}
     */
    Color.prototype.toString = function () {
        return "rgba(" +
            this.r.toFixed(2) + ", " +
            this.g.toFixed(2) + ", " +
            this.b.toFixed(2) + ", " +
            this.a.toFixed(2) + ")"
        ;
    };

    /**
     * @method setR
     * @param {number} red - the new Red component
     * @return {Color} this color
     */
    Color.prototype.setR = function (red) {
        this.r = red;
        return this;
    };
    /**
     * @method setG
     * @param {number} green - the new Green component
     * @return {Color} this color
     */
    Color.prototype.setG = function (green) {
        this.g = green;
        return this;
    };
    /**
     * @method setB
     * @param {number} blue - the new Blue component
     * @return {Color} this color
     */
    Color.prototype.setB = function (blue) {
        this.b = blue;
        return this;
    };
    /**
     * @method setA
     * @param {number} alpha - the new Alpha component
     * @return {Color} this color
     */
    Color.prototype.setA = function (alpha) {
        this.a = alpha;
        return this;
    };

    /**
     * @method toCSS
     * @param {string} opt - "rgba", "rgb", "#rgb" or "#rrggbb"
     * @return {string}
     */
    Color.prototype.toCSS = function ( opt ) {
        if ( opt === 'rgba' ) {
            return "rgba(" +
                (this.r * 255 | 0 ) + "," +
                (this.g * 255 | 0 ) + "," +
                (this.b * 255 | 0 ) + "," +
                this.a.toFixed(2) + ")"
            ;
        }
        else if ( opt === 'rgb' ) {
            return "rgb(" +
                (this.r * 255 | 0 ) + "," +
                (this.g * 255 | 0 ) + "," +
                (this.b * 255 | 0 ) + ")"
            ;
        }
        else {
            return '#' + this.toHEX(opt);
        }
    };

    /**
     * Clamp this color to make all components between 0 to 1.
     * @method clamp
     */
    Color.prototype.clamp = function () {
        this.r = Math.clamp01(this.r);
        this.g = Math.clamp01(this.g);
        this.b = Math.clamp01(this.b);
        this.a = Math.clamp01(this.a);
    };

    /**
     * @method fromHEX
     * @param {string} hexString
     * @return {Color}
     * @chainable
     */
    Color.prototype.fromHEX = function (hexString) {
        var hex = parseInt(((hexString.indexOf('#') > -1) ? hexString.substring(1) : hexString), 16);
        this.r = (hex >> 16)/255;
        this.g = ((hex & 0x00FF00) >> 8)/255;
        this.b = ((hex & 0x0000FF))/255;
        return this;
    };

    /**
     * @method toHEX
     * @param {string} fmt - "#rgb" or "#rrggbb"
     * @return {string}
     */
    Color.prototype.toHEX = function ( fmt ) {
        var hex = [
            (this.r * 255 | 0 ).toString(16),
            (this.g * 255 | 0 ).toString(16),
            (this.b * 255 | 0 ).toString(16),
        ];
        var i = -1;
        if ( fmt === '#rgb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length > 1 ) {
                    hex[i] = hex[i][0];
                }
            }
        }
        else if ( fmt === '#rrggbb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length === 1 ) {
                    hex[i] = '0' + hex[i];
                }
            }
        }
        return hex.join('');
    };

    /**
     * Convert to 24bit rgb value
     * @method toRGBValue
     * @return {number}
     */
    Color.prototype.toRGBValue = function () {
        return (Math.clamp01(this.r) * 255 << 16) +
               (Math.clamp01(this.g) * 255 << 8) +
               (Math.clamp01(this.b) * 255);
    };

    /**
     * @method fromHSV
     * @param {number} h
     * @param {number} s
     * @param {number} v
     * @return {Color}
     * @chainable
     */
    Color.prototype.fromHSV = function ( h, s, v ) {
        var rgb = Fire.hsv2rgb( h, s, v );
        this.r = rgb.r;
        this.g = rgb.g;
        this.b = rgb.b;
        return this;
    };

    /**
     * @method toHSV
     * @return {object} - {h: number, s: number, v: number}
     */
    Color.prototype.toHSV = function () {
        return Fire.rgb2hsv( this.r, this.g, this.b );
    };

    return Color;
})();

Fire.Color = Color;

/**
 * The convenience method to create a new <% crosslink Fire.Color Color %>
 * @method color
 * @param {number} [r=0]
 * @param {number} [g=0]
 * @param {number} [b=0]
 * @param {number} [a=1]
 * @return {Color}
 */
Fire.color = function color (r, g, b, a) {
    if (Array.isArray(r)) {
        return new Color(r[0], r[1], r[2], r[3]);
    }
    else {
        return new Color(r, g, b, a);
    }
};
