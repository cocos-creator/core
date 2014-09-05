﻿var _doGetTrimRect = function (pixelBuffer, w, h, trimThreshold) {
    // A B C
    // D x F
    // G H I

    var tx = w, ty = h,
        tw = 0, th = 0,
        ditch = w * 4;

    var x, y, i;
    var index;  // alpha index in pixels

    // trim A B C
    for (y = 0; y < h; y++) {
        index = y * ditch + 3;  // (x + y * w) * 4 + 3
        for (x = 0; x < w; x++, index += 4) {
            if (pixelBuffer[index] >= trimThreshold) {
                ty = y;
                y = h;
                break;
            }
        }
    }
    // trim G H I
    for (y = h - 1; y >= ty; y--) {
        index = y * ditch + 3;
        for (x = 0; x < w; x++, index += 4) {
            if (pixelBuffer[index] >= trimThreshold) {
                th = y - ty + 1;
                y = 0;
                break;
            }
        }
    }
    var skipTrimmedY = ditch * ty;   // skip A B C
    // trim D
    for (x = 0; x < w; x++) {
        index = skipTrimmedY + x * 4 + 3;
        for (i = 0; i < th; i++, index += ditch) {
            if (pixelBuffer[index] >= trimThreshold) {
                tx = x;
                x = w;
                break;
            }
        }
    }
    // trim F
    for (x = w - 1; x >= tx; x--) {
        index = skipTrimmedY + x * 4 + 3;
        for (i = 0; i < th; i++, index += ditch) {
            if (pixelBuffer[index] >= trimThreshold) {
                tw = x - tx + 1;
                x = 0;
                break;
            }
        }
    }

    return new FIRE.Rect(tx, ty, tw, th);
};

//
FIRE.getEnumList = function (enumDef) {
    if ( enumDef.__enums__ !== undefined )
        return enumDef.__enums__;

    var enums = [];
    for ( var entry in enumDef ) {
        if ( enumDef.hasOwnProperty(entry) ) {
            var test = parseInt(entry);
            if ( isNaN(test) ) {
                enums.push( { name: enumDef[enumDef[entry]], value: enumDef[entry] } );
            }
        }
    }
    enums.sort( function ( a, b ) { return a.value - b.value; } );

    enumDef.__enums__ = enums;
    return enumDef.__enums__;
};

//
FIRE.getVarFrom = function ( obj, text ) {
    var res = text.split('.');
    var curObj = obj; 
    for ( var i = 0; i < res.length; ++i ) {
        var name = res[i];
        curObj = curObj[name];
        if ( curObj === undefined || curObj === null )
            return null;
    }
    return curObj;
};

// r, g, b must be [0.0, 1.0]
FIRE.rgb2hsv = function ( r, g, b ) {
    var hsv = { h: 0, s: 0, v: 0 };
    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    var delta = 0;
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) hsv.h = 0;
    else {
        delta = max - min;
        if (r == max) hsv.h = (g - b) / delta;
        else if (g == max) hsv.h = 2 + (b - r) / delta;
        else hsv.h = 4 + (r - g) / delta;
        hsv.h /= 6;
        if (hsv.h < 0) hsv.h += 1.0;
    }
    return hsv;
};

// the return rgb will be in [0.0, 1.0]
FIRE.hsv2rgb = function ( h, s, v ) {
    var rgb = { r: 0, g: 0, b: 0 };
    if (s === 0) {
        rgb.r = rgb.g = rgb.b = v;
    }
    else {
        if (v === 0) {
            rgb.r = rgb.g = rgb.b = 0;
        }
        else {
            if (h === 1) h = 0;
            h *= 6;
            s = s;
            v = v;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - (s * f));
            var t = v * (1 - (s * (1 - f)));
            switch (i) {
                case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;

                case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;

                case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;

                case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;

                case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;

                case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
            }
        }
    }
    return rgb;
};

// Support can be assigned a null value type
FIRE.Nullable = (function () {
    function Nullable(hasValue, value) {
        this.hasValue = haValue;
        this.value = value;
    }
    return Nullable;
})();