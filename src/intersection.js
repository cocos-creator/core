Fire.Intersection = (function () {
    var Intersection = {};

    Intersection.rectRect = function ( a, b ) {
        var a_min_x = a.x;
        var a_min_y = a.y;
        var a_max_x = a.x + a.width;
        var a_max_y = a.y + a.height;

        var b_min_x = b.x;
        var b_min_y = b.y;
        var b_max_x = b.x + b.width;
        var b_max_y = b.y + b.height;

        return a_min_x <= b_max_x && 
               a_max_x >= b_min_x && 
               a_min_y <= b_max_y && 
               a_max_y >= b_min_y
               ;
    };

    return Intersection;
})();
