﻿/**
 * Simple matrix to do 2D affine transformations.
 * It is actually 3x3 but the last row is [0 0 1].
 * @class FIRE.Matrix2x3
 */
var Matrix2x3 = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
};
FIRE.registerClass('FIRE.Matrix2x3', Matrix2x3);
FIRE.Matrix2x3 = Matrix2x3;

Matrix2x3.identity = new Matrix2x3();

Matrix2x3.prototype.clone = function () {
    var mat = new Matrix2x3();
    mat.a = this.a;
    mat.b = this.b;
    mat.c = this.c;
    mat.d = this.d;
    mat.tx = this.tx;
    mat.ty = this.ty;
    return mat;
};

Matrix2x3.prototype.toString = function () {
    return '|' + this.a.toFixed(2) + ' ' + this.b.toFixed(2) + ' ' + this.tx.toFixed(2) + 
        '|\n|' + this.c.toFixed(2) + ' ' + this.d.toFixed(2) + ' ' + this.ty.toFixed(2) + 
        '|\n|0.00 0.00 1.00|';
};

Matrix2x3.prototype.identity = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

Matrix2x3.prototype.prepend = function (other) {
    var a = other.a;
    var b = other.b;
    var c = other.c;
    var d = other.d;
    if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
        var oa = this.a;
        var oc = this.c;
        this.a = oa * a + this.b * c;
        this.b = oa * b + this.b * d;
        this.c = oc * a + this.d * c;
        this.d = oc * b + this.d * d;
        var otx = this.tx;
        this.tx = otx * a + this.ty * c + other.tx;
        this.ty = otx * b + this.ty * d + other.ty;
    }
    else {
        this.tx += other.tx;
        this.ty += other.ty;
    }
    return this;
};

Matrix2x3.prototype.invert = function () {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var tx = this.tx;
    var determinant = 1 / (a * d - b * c);
    this.a = d * determinant;
    this.b = -b * determinant;
    this.c = -c * determinant;
    this.d = a * determinant;
    this.tx = (c * this.ty - d * tx) * determinant;
    this.ty = (b * tx - a * this.ty) * determinant;
    return this;
};

Matrix2x3.prototype.transformPoint = function (vector, out) {
    out = out || new Vec2();
    var x = vector.x;   // vector may === out
    out.x = this.a * x + this.c * vector.y + this.tx;
    out.y = this.b * x + this.d * vector.y + this.ty;
    return out;
};

// negative scaling (mirroring) is not supported
Matrix2x3.prototype.getScale = function (out) {
    out = out || new Vec2();
    out.x = Math.sqrt(this.a * this.a + this.b * this.b);
    out.y = Math.sqrt(this.c * this.c + this.d * this.d);
    return out;
};

Matrix2x3.prototype.setScale = function (x, y) {
    var s = this.getScale();
    x /= s.x;
    y /= s.y;
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
};

/*
Matrix2x3.prototype.getRotation = function () {
    return Math.atan2(this.c, this.d);  // or atan2(-b, a);
};

Matrix2x3.prototype.translate = function (x, y) {
    this.tx += x;
    this.ty += y;
};

Matrix2x3.prototype.scale = function (x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
};
*/