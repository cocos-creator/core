﻿// jshint ignore: start

largeModule('serialize');

var match = function (obj, expect, info) {
    deepEqual(JSON.parse(FIRE.serialize(obj)), expect, info);
};

test('basic test', function() {
    match({}, {}, 'smoke test1');
    match([], [], 'smoke test2');

    var MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);

            this.emptyArray = [];
            this.array = [1, '2', {a:3}, [4, [5]], true];
            this.string = 'unknown'; 
            this.number = 1;
            this.boolean = true;
            this.emptyObj = {};
            this.obj = {};
        }
        FIRE.extend('MyAsset', MyAsset, _super);

        // should not serialize ----------------------------
        MyAsset.staticFunc = function () { };
        MyAsset.staticProp = (function (t) {
            t[t.UseBest    = 0] = 'UseBest';
            t[t.Ascending  = 1] = 'Ascending';
            t[t.Descending = 2] = 'Descending';
            return t;
        })({});
        MyAsset.prototype.protoFunc = function () { };
        MyAsset.prototype.protoProp = 123;
        // -------------------------------------------------

        return MyAsset;
    })();
    var asset = new MyAsset();
    asset.dynamicProp = false;

    var expect = {
        __type__: 'MyAsset',
        emptyArray: [],
        array: [1, '2',  {a:3}, [4, [5]], true],
        string: 'unknown',
        number: 1,
        boolean: true,
        emptyObj: {},
        obj: {},
        dynamicProp: false,
    };

    match(asset, expect, 'type test');
    match(asset, expect, 'test re-serialize again');

    FIRE.unregisterNamedClass(MyAsset);
});

test('test circular reference', function () {
    var MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]
        }
        FIRE.extend('MyAsset', MyAsset, _super);

        return MyAsset;
    })();
    var asset = new MyAsset();

    var expect = [
        [ 1,  [{ __id__: 0 }, 2] ],  // You'll get two copies of array2
        [ [1, {__id__: 1}],  2 ],    // You'll get two copies of array1
        {
            __type__: 'MyAsset',
            array1: { __id__: 0 },
            array2: { __id__: 1 },
        }
    ];
    match(asset, expect, 'two arrays can circular reference each other');
    match(asset, expect, 'test re-serialize again');
    FIRE.unregisterNamedClass(MyAsset);

    MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        FIRE.extend('MyAsset', MyAsset, _super);

        return MyAsset;
    })();
    asset = new MyAsset();

    expect = [
        { /*__id__: 0,*/ num:1, other: {num:2, other: {__id__: 0}} },  // You'll get two copies of dict2
        { /*__id__: 1,*/ num:2, other: {num:1, other: {__id__: 1}} },  // You'll get two copies of dict1
        {
            __type__: 'MyAsset',
            dict1: { __id__: 0 },
            dict2: { __id__: 1 },
        }
    ];
    match(asset, expect, 'two dicts can circular reference each other');

    asset.sameRef = asset.dict2;
    expect[2].sameRef = { __id__: 1 };
    match(asset, expect, 'more referenced object just serialize its id');

    FIRE.unregisterNamedClass(MyAsset);
});

test('test type created by FIRE.define', function () {
    var Sprite = FIRE.define('Sprite', function () {
        this.image = 'sprite.png';
    })
    Sprite.prop('size', new FIRE.Vec2(128, 128));

    var sprite = new Sprite();
    var actual = JSON.parse(FIRE.serialize(sprite));

    strictEqual(actual.image, undefined, 'should not serialize variable which not defined by property');

    var expected = {
        __type__: 'Sprite',
        size: {
            __type__: "FIRE.Vec2",
            x: 128,
            y: 128
        }
    };

    deepEqual(actual, expected, 'can serialize');

    FIRE.undefine(Sprite);
});

test('test serializable attributes', function () {
    var Sprite = FIRE.define('Sprite')
                     .prop('trimThreshold', 2, FIRE.EditorOnly)
                     .prop('_isValid', true, FIRE.NonSerialized);

    var sprite = new Sprite();
    var actualInEditor = JSON.parse(FIRE.serialize(sprite));
    var actualInPlayer = JSON.parse(FIRE.serialize(sprite, true));

    strictEqual(actualInEditor.trimThreshold, 2, 'serialize editor only in editor');
    strictEqual(actualInPlayer.trimThreshold, undefined, 'should not serialize editor only in player');

    strictEqual(actualInEditor._isValid, undefined, 'should not serialize non-serialized in editor');
    strictEqual(actualInPlayer._isValid, undefined, 'should not serialize non-serialized in player');

    FIRE.undefine(Sprite);
});

// jshint ignore: end
