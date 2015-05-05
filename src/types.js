/**
 * @class TextAlign
 * @static
 */
Fire.TextAlign = Fire.defineEnum({
    /**
     * @property left
     * @type {number}
     */
    Left: -1,
    /**
     * @property center
     * @type {number}
     */
    Center: -1,
    /**
     * @property right
     * @type {number}
     */
    Right: -1
});

/**
 * @class TextAnchor
 * @static
 */
Fire.TextAnchor = (function (t) {
    /**
     * @property topLeft
     * @type {number}
     */
    t[t.TopLeft = 0] = 'Top Left';
    /**
     * @property topCenter
     * @type {number}
     */
    t[t.TopCenter = 1] = 'Top Center';
    /**
     * @property topRight
     * @type {number}
     */
    t[t.TopRight = 2] = 'Top Right';
    /**
     * @property midLeft
     * @type {number}
     */
    t[t.MidLeft = 3] = 'Middle Left';
    /**
     * @property midCenter
     * @type {number}
     */
    t[t.MidCenter = 4] = 'Middle Center';
    /**
     * @property midRight
     * @type {number}
     */
    t[t.MidRight = 5] = 'Middle Right';
    /**
     * @property botLeft
     * @type {number}
     */
    t[t.BotLeft = 6] = 'Bottom Left';
    /**
     * @property botCenter
     * @type {number}
     */
    t[t.BotCenter = 7] = 'Bottom Center';
    /**
     * @property botRight
     * @type {number}
     */
    t[t.BotRight = 8] = 'Bottom Right';
    return t;
})({});

/**
 * @class FontType
 * @static
 */
Fire.FontType = Fire.defineEnum({
    /**
     * @property Arial
     * @type {number}
     */
    Arial: -1,
    /**
     * @property Custom
     * @type {number}
     */
    Custom: -1
});
