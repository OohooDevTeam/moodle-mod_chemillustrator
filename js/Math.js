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
 * Get the distance between points (x1, y1) and (x2, y2)
 *
 * @param x1 X1 coordinate
 * @param y1 Y1 coordinate
 * @param x2 X2 coordinate
 * @param y2 Y2 coordinate
 * @return Distance between the 2 points
 */
Math.distance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Get the angle between points (x1, y1) and (x2, y2)
 *
 * @param x1 X1 coordinate
 * @param y1 Y1 coordinate
 * @param x2 X2 coordinate
 * @param y2 Y2 coordinate
 * @return Angle in radians
 */
Math.angle = function(x1, y1, x2, y2) {
    var angle = Math.atan((y1 - y2) / (x2 - x1));
    //Correct the angle from CAST sign errors
    if (x2 < x1) {
        angle += Math.PI;
    }
    else if (y2 > y1) {
        angle += 2*Math.PI;
    }

    return angle;
}

/**
 * Round a value to the nearest interval
 *
 * @param value Value to round
 * @param interval Interval to round to
 * @return Value to the nearest interval
 */
Math.snap = function(value, interval) {
    return (interval * Math.round(value / interval));
}
