/**
 * @method FIRE.extend
 * Derive the class from the supplied base class.
 * Both classes are just native javascript constructors, not created by FIRE.define, so
 * usually you will want to inherit using FIRE.define instead.
 * 
 * @param {string} className
 * @param {function} cls
 * @param {function} base - the baseclass to inherit
 * @returns {function} the base class
 * 
 * @see FIRE.define
 */
FIRE.extend = function (className, cls, base) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
    FIRE.setClassName(cls, className);
    return base;
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class)
 * @param {(object|function)} obj - instance or constructor
 * @returns {string}
 */
FIRE.getClassName = function (obj) {
    if (typeof obj === 'function' && obj.prototype.__classname__) {
        return obj.prototype.__classname__;
    }
    if (obj && obj.constructor) {
        if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__classname__')) {
            return obj.__classname__;
        }
        var retval;
        //  for browsers which have name property in the constructor of the object, such as chrome 
        if (obj.constructor.name) {
            retval = obj.constructor.name;
        }
        if (obj.constructor.toString) {
            var arr, str = obj.constructor.toString();
            if (str.charAt(0) === '[') {
                // str is "[object objectClass]"
                arr = str.match(/\[\w+\s*(\w+)\]/);
            }
            else {
                // str is function objectClass () {} for IE Firefox
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length === 2) {
                retval = arr[1];
            }
        }
        return retval !== 'Object' ? retval : null;
    }
    return null;
};

var _nameToClass = {};

/**
 * Set the name of a class
 * @method FIRE.setClassName
 * @param {function} constructor
 * @param {string} className
 */
FIRE.setClassName = function (constructor, className) {
    constructor.prototype.__classname__ = className;
    // register class
    if (className) {
        var registered = _nameToClass[className];
        if (registered && registered !== constructor) {
            console.error('A Class already exists with that name: "' + className + '".\
If you dont need serialization, you can set class name to "". You can also call \
FIRE.undefine or FIRE.unregisterNamedClass to remove the name of unused class');
            return;
        }
        _nameToClass[className] = constructor;
    }
};

/**
 * Get the registered class by name
 * @method FIRE.getClassByName
 * @param {string} className
 * @returns {function} constructor
 */
FIRE.getClassByName = function (className) {
    return _nameToClass[className];
};

/**
 * Unregister the classes extended by FIRE.extend. If you dont need it anymore, 
 * you'd better unregister it to reduce memory usage.
 * Please note that its still your responsibility to free other references to the class.
 *
 * @method FIRE.unregisterNamedClass
 * @param {function} constructor
 *
 * @private
 */
FIRE.unregisterNamedClass = function (constructor) {
    var className = constructor.prototype.__classname__;
    if (className) {
        delete _nameToClass[className];
    }
};
