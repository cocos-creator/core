//
FIRE.buildPng = function (canvas, filename, pixelBuffer, returnBinOrBase64, callback) {
    function getLibpng(callback) {
        if (typeof(libpng) !== 'undefined') {
            callback(libpng);
            return true;
        }
        else if (requirejs) {
            requirejs(['libpng'], callback);
            return true;
        }
        return false;
    }
    function encodeByLibpng(libpng) {
        console.time('png');
        var png = libpng.createWriter(canvas.width, canvas.height);
        png.set_filter(libpng.FILTER_NONE);
        png.set_compression_level(3);
        png.write_imageData(pixelBuffer);
        png.write_end();
        console.timeEnd('png');
        //console.log('Bytes: ' + png.data.length);
        if (returnBinOrBase64 || FIRE.isNode) {
            callback( { bin: png.data } );
        }
        else {
            var blob = new Blob([new Uint8Array(png.data)], {type: 'image/png'});
            callback( { blob: blob } );
        }
    }
    if ( getLibpng (encodeByLibpng) === false ) {
        // encode by canvas
        if (!canvas) {
            throw new Error('no png encoder nor canvas');
        }
        if (returnBinOrBase64 || FIRE.isNode) {
            var dataUrl = canvas.toDataURL('image/png');
            var base64 = FIRE.imgDataUrlToBase64(dataUrl);
            callback( { base64: base64 } );
        }
        else {
            callback( { canvas: canvas } );
        }
    }
};

FIRE.savePng = function (data, filename, path, zip) {
    var type = Object.keys(data)[0];
    var value = data[type];
    if (zip) {
        if (type === 'bin') {
            zip.file(filename, value);
        }
        else if (type === 'base64') {
            zip.file(filename, value, { base64: true });
        }
        else {
            console.error('unknown data type to zip');
        }
        return;
    }
    if (FIRE.isNode) {
        if (type === 'bin') {
            Fs.writeFileSync(path, new Buffer(value));
        }
        else if (type === 'base64') {
            Fs.writeFileSync(path, value, {'encoding': 'base64'});
        }
        else {
            console.warn('unknown node type: ' + type);
        }
    }
    else {
        if (type === 'blob') {
            FIRE.downloadBlob(value, filename);
        }
        else if (type === 'canvas') {
            FIRE.downloadCanvas(value, filename);
        }
        else {
            console.warn('unknown browser type: ' + type);
        }
    }
};

FIRE.saveText = function (text, filename, path) {
    if (FIRE.isNode) {
        Fs.writeFileSync(path, text, {'encoding': 'ascii'});
    }
    else {
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});    // not support 'application/json'
        FIRE.downloadBlob(blob, filename);
    }
};
