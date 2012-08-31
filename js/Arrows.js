/* ************************************************************************
 * *                         ChemIllustrator                             **
 * ************************************************************************
 * @package     mod                                                      **
 * @subpackage  chemillustrator                                          **
 * @name        ChemIllustrator                                          **
 * @copyright   oohoo.biz                                                **
 * @link        http://oohoo.biz                                         **
 * @author      Braedan Jongerius <jongeriu@ualberta.ca> 2012            **
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later **
 * ************************************************************************
 * ************************************************************************/

/**
 * Create an Arrow object between (x1, y1) and (x2, y2)
 *
 * @param x1 X1 coordinate
 * @param y1 Y1 coordinate
 * @param x2 X2 coordinate
 * @param y2 Y2 coordinate
 * @param text Arrow's text
 * @param cpy Curvature y coordinate
 * @return Arrow
 */
function Arrow(x1, y1, x2, y2, text, cpy) {
    this.id = 0;

    //Locations
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    //Center location
    this.cx = 0;
    this.cy = 0;

    //Arrow body
    this.angle = 0;
    this.length = 0;

    //Text attached to the Arrow
    this.text = "";

    //The y coordinate of the curvature point
    this.cpy = 0;
    //Angle of the tip
    this.tipAngle = 0;

    //Calculate Arrow data
    this.update(x1, y1, x2, y2, text, cpy);
}

/**
 * Draw the Arrow object
 *
 * @return void
 */
Arrow.prototype.draw = function() {
    //Save the current canvas state
    ctx.save();

    //Move canvas to starting point
    ctx.translate(this.x1, this.y1);
    //Rotate canvas
    ctx.rotate(-this.angle);
    //Draw the Arrow's body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (this.cpy == 0) {
        ctx.lineTo(this.length, 0);
    }
    else {
        ctx.quadraticCurveTo(this.length / 2, -2 * this.cpy, this.length, 0);
    }
    ctx.stroke();

    //Draw the Arrow's text
    if (this.text != "") {
        var atomText = new Text();
        ctx.save();
        if (this.angle <= Math.PI/2 || this.angle >= 3*Math.PI/2) {
            atomText.update(this.length/2, -this.cpy, this.text);
        }
        else {
            ctx.rotate(Math.PI);
            atomText.update(-this.length/2, this.cpy, this.text);
        }
        atomText.draw();
        ctx.restore();
    }

    //Move canvas to the end of the body
    ctx.translate(this.length, 0);
    if (this.cpy != 0) {
        ctx.rotate(-this.tipAngle);
    }
    //Draw the Arrow's tip
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-8, 8);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a boundary/circle in the middle of the Arrow object
 *
 * @param color Color of the boundary/circle
 * @param radius Radius of the boundary/circle
 * @return void
 */
Arrow.prototype.drawBoundary = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}

/**
 * Draw a boundary/circle around the end(s) of the Arrow object
 *
 * @param color Color of the boundary/circle
 * @param radius Radius of the boundary/circle
 * @param end Which end you want to draw: 1(tail), 2(tip), null(both)
 * @return void
 */
Arrow.prototype.drawEndBoundary = function(color, radius, end) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    //Draw the tail end
    if (end == null || end == 1) {
        ctx.beginPath();
        ctx.arc(this.x1, this.y1, radius, 0, 2*Math.PI);
        ctx.stroke();
    }
    //Draw the tip end
    if (end == null || end == 2) {
        ctx.beginPath();
        ctx.arc(this.x2, this.y2, radius, 0, 2*Math.PI);
        ctx.stroke();
    }
    //Restore the state
    ctx.restore();
}

/**
 * Update the Arrow object's location and/or text and/or curvature
 *
 * @param x1 New x1 coordinate
 * @param y1 New y1 coordinate
 * @param x2 New x2 coordinate
 * @param y2 New y2 coordinate
 * @param text New text
 * @param cpy New curvature y coordinate
 * @return void
 */
Arrow.prototype.update = function(x1, y1, x2, y2, text, cpy) {
    if (x1 != null) {
        this.x1 = x1;
    }
    if (y1 != null) {
        this.y1 = y1;
    }
    if (x2 != null) {
        this.x2 = x2;
    }
    if (y2 != null) {
        this.y2 = y2;
    }
    if (text != null) {
        this.text = text;
    }
    if (cpy != null) {
        this.cpy = cpy;
    }

    //Calculate data (only if x1 or y1 or x2 or y2 or cpy has changed)
    if (x1 != null || y1 != null || x2 != null || y2 != null || cpy != null) {
        this.cx = (this.x1 + this.x2)/2;
        this.cy = (this.y1 + this.y2)/2;
        
        this.angle = Math.angle(this.x1, this.y1, this.x2, this.y2);
        this.length =  Math.distance(this.x1, this.y1, this.x2, this.y2);

        //Calculate new center and tip angle
        var dx = -this.cpy*Math.sin(this.angle);
        var dy = -this.cpy*Math.cos(this.angle);
        this.cx += dx;
        this.cy += dy;
        this.tipAngle = Math.angle(this.cx, this.cy + dy, this.x2, this.y2) - this.angle;
    }
}
