Math.distance = function(p1, p2) {
    //Return the distance between point 1 and point 2
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
Math.angle = function(p1, p2) {
    var angle = Math.atan((p1.y - p2.y) / (p2.x - p1.x));
    //Correct the angle from CAST sign errors
    if (p2.x < p1.x)
        angle += Math.PI;
    else if (p2.y > p1.y)
        angle += 2*Math.PI;
    //Return the angle which is now in radians
    return angle;
}
Math.center = function(point1, point2) {
    //Return the center
    return new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
}
Math.snap = function(value, interval) {
    //Return the value to the closest interval
    return (interval * Math.round(value / interval));
}
Math.textWidth = function(text, fonttype) {
    //Save the current state
    ctx.save();
    ctx.font = fonttype;
    //Get the width of the text
    var temp = ctx.measureText(text).width;
    //Restore last canvas state
    ctx.restore();
    //Return the width
    return temp;
}
