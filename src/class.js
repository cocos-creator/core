﻿// helper functions for defining Classes

// both getter and prop must register the name into __props__ array
var _appendProp = function (name/*, isGetter*/) {
    // @ifdef DEV
    var JsVarReg = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!JsVarReg.test(name)) {
        Fire.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        return;
    }
    // @endif

    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        // 这里不进行报错，因为重写 prop 可以是一个合法的行为，可以用于设置新的默认值。
        //else {
        //    Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
        //}
    }
};

/**
 * @param {object} obj
 * @returns {boolean} is {} ?
 */
var _isPlainEmptyObj = function (obj) {
    if (obj.constructor !== ({}).constructor) {
        return false;
    }
    // jshint ignore: start
    for (var k in obj) {
        return false;
    }
    // jshint ignore: end
    return true;
};

var _cloneable = function (obj) {
    return obj && typeof obj.clone === 'function' && (obj.constructor.prototype.hasOwnProperty('clone') || obj.hasOwnProperty('clone'));
};

/**
 * the metaclass of the "fire class" created by Fire.define, all its static members
 * will inherited by fire class.
 */
var _metaClass = {

    /**
     * @property {string[]} class.__props__
     * @private
     */
    __props__: null,

    /**
     * Add new instance field, propertie, or method made available on the class.
     * 该方法定义的变量默认情况下都会被序列化，也会在inspector中显示。
     * 如果传入属性包含Fire.HideInInspector则仍会序列化但不在inspector中显示。
     * 如果传入属性包含Fire.NonSerialized则不会序列化并且不会在inspector中显示。
     * 如果传入属性包含Fire.EditorOnly则只在编辑器下序列化，打包时不序列化。
     *
     * @method class.prop
     * @param {string} name - the property name
     * @param {*} defaultValue - the default value
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    prop: function (name, defaultValue, attribute) {
        'use strict';
        // @ifdef DEV
        // check default object value
        if (typeof defaultValue === 'object' && defaultValue) {
            if (Array.isArray(defaultValue)) {
                // check array empty
                if (defaultValue.length > 0) {
                    Fire.error('Default array must be empty, set default value of ' + Fire.getClassName(this) + '.prop("' + name +
                        '", ...) to null or [], and initialize in constructor please. (just like "this.' +
                        name + ' = [...];")');
                    return this;
                }
            }
            else if (!_isPlainEmptyObj(defaultValue)) {
                // check cloneable
                if (!_cloneable(defaultValue)) {
                    Fire.error('Do not set default value to non-empty object, unless the object defines its own "clone" function. Set default value of ' + Fire.getClassName(this) + '.prop("' + name +
                        '", ...) to null or {}, and initialize in constructor please. (just like "this.' +
                        name + ' = {foo: bar};")');
                    return this;
                }
            }
        }
        // @endif

        // @ifdef DEV
        // check base prototype to avoid name collision
        for (var base = this.$super; base; base = base.$super) {
            // 这个循环只能检测到最上面的FireClass的父类，如果再上还有父类，将不做检测。（Fire.extend 将 prototype.constructor 设为子类）
            if (base.prototype.hasOwnProperty(name)) {
                Fire.error('Can not declare ' + Fire.getClassName(this) + '.' + name +
                           ', it is already defined in the prototype of ' + Fire.getClassName(base));
                return;
            }
        }
        // @endif

        // set default value
        Fire.attr(this, name, { 'default': defaultValue });

        // register property
        _appendProp.call(this, name);

        // 禁用，因为getter/setter需要动态获得类型，所以类型统一由上层处理
        //// apply default type (NOTE: if user provide type attribute, this one will be overwrote)
        //var mytype = typeof defaultValue;
        //if ( mytype === 'number' ) {
        //    mytype = 'float';
        //}
        //Fire.attr( this, name, { 'type': mytype } );

        // apply attributes
        if (attribute) {
            var onAfterProp = null;
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // register callback
                if (attr._onAfterProp) {
                    onAfterProp = onAfterProp || [];
                    onAfterProp.push(attr._onAfterProp);
                }
            }
            // call callback
            if (onAfterProp) {
                for (var c = 0; c < onAfterProp.length; c++) {
                    onAfterProp[c](this, name);
                }
            }
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    get: function (name, getter, attribute) {
        'use strict';

        // @ifdef DEV
        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.get) {
            Fire.error(Fire.getClassName(this) + ': the getter of "' + name + '" is already defined!');
            return this;
        }
        // @endif

        // @ifdef DEV
        var displayInInspector = true;
        // @endif
        if (attribute) {
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                // @ifdef DEV
                if (attr._canUsedInGetter === false) {
                    Fire.error('Can not apply the specified attribute to the getter of "' + Fire.getClassName(this) + '.' + name + '", attribute index: ' + (i - AttrArgStart));
                    continue;
                }
                // @endif

                Fire.attr(this, name, attr);

                // @ifdef DEV
                // check attributes
                if (attr.hideInInspector) {
                    displayInInspector = false;
                }
                if (attr.serializable === false || attr.editorOnly === true) {
                    Fire.warn('No need to use Fire.NonSerialized or Fire.EditorOnly for the getter of ' +
                        Fire.getClassName(this) + '.' + name + ', every getter is actually non-serialized.');
                }
                if (attr.hasOwnProperty('default')) {
                    Fire.error(Fire.getClassName(this) + ': Can not set default value of a getter!');
                    return this;
                }
                // @endif
            }
        }
        Fire.attr(this, name, Fire.NonSerialized);

        // @ifdef DEV
        if (displayInInspector) {
            _appendProp.call(this, name/*, true*/);
        }
        else {
            var index = this.__props__.indexOf(name);
            if (index >= 0) {
                Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
                return this;
            }
        }
        // @endif
        Object.defineProperty(this.prototype, name, {
            get: getter,
            configurable: true
        });
        // @ifdef EDITOR
        Fire.attr(this, name, { hasGetter: true }); // 方便 editor 做判断
        // @endif
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，除非有对应的getter否则不在inspector中显示。
     *
     * @method class.set
     * @param {string} name - the setter property
     * @param {function} setter - the setter function
     * @returns {function} the class itself
     */
    set: function (name, setter) {
        // @ifdef DEV
        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.set) {
            Fire.error(Fire.getClassName(this) + ': the setter of "' + name + '" is already defined!');
            return this;
        }
        // @endif
        // ================================================================
        // @ifdef EDITOR
        Object.defineProperty(this.prototype, name, {
            set: function (value) {
                if (this._observing) {
                     Object.getNotifier(this).notify({
                        type: 'update',
                        name: name,
                        oldValue: this[name]
                    });
                }
                setter.call(this, value);
            },
            configurable: true
        });
        // @endif
        // ----------------------------------------------------------------
        // @ifndef EDITOR
        Object.defineProperty(this.prototype, name, {
            set: setter,
            configurable: true
        });
        // @endif
        // ================================================================
        // @ifdef EDITOR
        Fire.attr(this, name, { hasSetter: true }); // 方便 editor 做判断
        Fire.attr(this, name, { originalSetter: setter }); // 方便 editor 重载 setter
        // @endif
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {function} setter - the setter function
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    getset: function (name, getter, setter, attribute) {
        this.get(name, getter, attribute);
        this.set(name, setter);
        return this;
    },
};

var _createInstanceProps = function (instance, itsClass) {
    var propList = itsClass.__props__;
    if (propList) {
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            var attrs = Fire.attr(itsClass, prop);
            if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default, default maybe 0
                var def = attrs.default;
                if (typeof def === 'object' && def) {
                    // 防止多个实例引用相同对象
                    if (def.clone) {
                        def = def.clone();
                    }
                    else if (Array.isArray(def)) {
                        def = [];
                    }
                    else {
                        def = {};
                    }
                }
                instance[prop] = def;
            }
        }
    }
};

/**
 * Checks whether the constructor is created by Fire.define
 *
 * @method Fire._isFireClass
 * @param {function} constructor
 * @returns {boolean}
 * @private
 */
Fire._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

/**
 * Checks whether subclass is child of superclass or equals to superclass
 *
 * @method Fire.isChildClassOf
 * @param {function} subclass
 * @param {function} superclass
 * @returns {boolean}
 */
Fire.isChildClassOf = function (subclass, superclass) {
    if (subclass && superclass) {
        // fireclass
        for (; subclass && subclass.$super; subclass = subclass.$super) {
            if (subclass === superclass) {
                return true;
            }
        }
        if (subclass === superclass) {
            return true;
        }
        // js class
        var dunderProto = Object.getPrototypeOf(subclass.prototype);
        while (dunderProto) {
            subclass = dunderProto.constructor;
            if (subclass === superclass) {
                return true;
            }
            dunderProto = Object.getPrototypeOf(subclass.prototype);
        }
    }
    return false;
};

/**
 * Creates a FireClass and returns its constructor function.
 * You can also creates a sub-class by supplying a baseClass parameter.
 *
 * @method Fire.define
 * @param {string} className - the name of class that is used to deserialize this class
 * @param {function} [baseOrConstructor] - The base class to inherit from.
 *                                         如果你的父类不是由Fire.define定义的，那么必须传入第三个参数(constructor)，否则会被当成创建新类而非继承类。
 *                                         如果你不需要构造函数，可以传入null。
 * @param {function} [constructor] - a constructor function that is used to instantiate this class,
 *                                   if not supplied, the constructor of base class will be called automatically
 * @param {[object[]]} instanceMembers - NYI
 * @param {[object[]]} staticMembers - NYI
 * @returns {function} the defined class
 *
 * @see Fire.extend
 */
Fire.define = function (className, baseOrConstructor, constructor) {
    'use strict';
    // check arguments
    var isInherit = false;
    switch (arguments.length) {
        case 2:
            isInherit = Fire._isFireClass(baseOrConstructor);
            break;
        case 3:
            isInherit = true;
            break;
    }
    var baseClass;
    if (isInherit) {
        baseClass = baseOrConstructor;
    }
    else {
        constructor = baseOrConstructor;
    }

    var fireClass = _createCtor(isInherit, constructor, baseClass);

    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(fireClass, staticMember, {
            value: _metaClass[staticMember],
            // __props__ is writable
            writable: staticMember === '__props__',
            // __props__ is enumerable so it can be inherited by Fire.extend
            enumerable: staticMember === '__props__',
        });
    }

    // inherit
    if (isInherit) {
        Fire.extend(fireClass, baseClass);
        fireClass.$super = baseClass;
        if (baseClass.__props__) {
            // copy __props__
            fireClass.__props__ = baseClass.__props__.slice();
        }
    }
    Fire.registerClass(className, fireClass);

    // @ifdef EDITOR
    _nicifyFireClass(fireClass, className);
    // @endif

    return fireClass;
};

function _createCtor (isInherit, constructor, baseClass) {
    var fireClass;
    if (constructor) {
        // constructor provided
        fireClass = function () {
            // @ifdef EDITOR
            this._observing = false;
            // @endif
            _createInstanceProps(this, fireClass);
            constructor.apply(this, arguments);
        };
    }
    else {
        if (isInherit) {
            // auto call base constructor
            fireClass = function () {
                // @ifdef EDITOR
                this._observing = false;
                // @endif
                _createInstanceProps(this, fireClass);
                baseClass.apply(this, arguments);
            };
        }
        else {
            // no constructor
            fireClass = function () {
                // @ifdef EDITOR
                this._observing = false;
                // @endif
                _createInstanceProps(this, fireClass);
            };
        }
    }
    return fireClass;
}

// @ifdef EDITOR
function _nicifyFireClass (fireClass, className) {
    if (className) {
        fireClass.toString = function () {
            var plain = Function.toString.call(this);
            return plain.replace('function ', 'function ' + Fire.getClassName(this));
        };
    }
}
// @endif

/**
 * If you dont need a class (which defined by Fire.define) anymore,
 * you'd better undefine it to reduce memory usage.
 * Please note that its still your responsibility to free other references to the class.
 *
 * @method Fire.undefine
 * @param {...function} [constructor] - the class you will want to undefine, any number of classes can be added
 *
 * @see Fire.define
 */
Fire.undefine = function (constructor) {
    'use strict';
    for (var i = 0; i < arguments.length; i++) {
        Fire.unregisterClass(arguments[i]);
    }
};

/**
 * Specially optimized define function only for internal base classes
 * @private
 */
Fire._fastDefine = function (className, constructor, serializableFields) {
    Fire.registerClass(className, constructor);
    constructor.__props__ = serializableFields;
    for (var i = 0; i < serializableFields.length; i++) {
        Fire.attr(constructor, serializableFields[i], Fire.HideInInspector);
    }
};
