﻿module('Attribute');

test('FIRE.attr', function () {
    var MyCompBase = function () {
        this.baseVal = [];
    };
    
    FIRE.attr(MyCompBase, 'baseVal', {
        data: 'waha'
    });

    strictEqual(FIRE.attr(MyCompBase, 'baseVal').data, 'waha', 'can get attribute');
    
    FIRE.attr(MyCompBase, 'baseVal').foo = { bar: 524 };
    strictEqual(FIRE.attr(MyCompBase, 'baseVal').foo.bar, 524, 'can assign directly');

    var attr = FIRE.attr(MyCompBase, 'baseVal', {
        cool: 'nice'
    });
    ok(attr.data && attr.cool && attr.foo, 'can merge multi attribute');

    FIRE.attr(MyCompBase, 'baseVal', {
        data: false
    });
    strictEqual(attr.data, false, 'can override attribute');

    // inherit

    var MyComp = function () { };
    FIRE.extend(MyComp, MyCompBase);
    var MyComp2 = function () { };
    FIRE.extend(MyComp2, MyCompBase);

    strictEqual(FIRE.attr(MyComp, 'baseVal').cool, 'nice', 'can get inherited attribute');

    FIRE.attr(MyComp, 'subVal', {}).cool = 'very nice';
    strictEqual(FIRE.attr(MyComp, 'subVal').cool, 'very nice', 'can have own attribute');

    strictEqual(FIRE.attr(MyCompBase, 'subVal'), undefined, 'base class not pulluted');
    strictEqual(FIRE.attr(MyComp2, 'subVal'), undefined, 'sibling class not pulluted');
});
