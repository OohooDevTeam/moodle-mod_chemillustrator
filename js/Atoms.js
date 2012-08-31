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
 * Create an Atom object at the location (x, y)
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param element Atom's element
 * @param charge Atom's charge
 * @return Atom
 */
function Atom(x, y, element, charge) {
    this.id = 0;

    //Location
    this.x = 0;
    this.y = 0;

    //Element of the atom
    this.element = "C";
    //Charge on the atom
    this.charge = 0;

    //IDs of Atoms this Atom is connected to
    this.connections = new Array();

    //Calculate Atom data
    this.update(x, y, element, charge);
}

/**
 * Draw the Atom object
 *
 * @return void
 */
Atom.prototype.draw = function() {
    var text = "";
    if (this.element != "C") {
        text += this.element;
    }
    if (this.charge != 0) {
        //Add the numerical value
        var number = Math.abs(this.charge);
        if (number != 1) {
            $.each(number.toString(), function(index, item) {
                text += "^" + item;
            });
        }
        //Add the charge symbol
        if (this.charge > 0) {
            text += "^" + "+";
        }
        else {
            text += "^" + "-";
        }
    }

    if (text != "") {
        var atomText = new Text(this.x, this.y, text);
        atomText.draw();
    }
}

/**
 * Draw a boundary/circle around the Atom object
 *
 * @param color Color of the boundary/circle
 * @param radius Radius of the boundary/circle
 * @return void
 */
Atom.prototype.drawBoundary = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}

/**
 * Update the Atom object's location and/or element and/or charge
 *
 * @param x New x location
 * @param y New y location
 * @param element New element
 * @param charge New charge
 * @return void
 */
Atom.prototype.update = function(x, y, element, charge) {
    if (x != null) {
        this.x = x;
    }
    if (y != null) {
        this.y = y;
    }
    if (element != null) {
        this.element = element;
    }
    if (charge != null) {
        this.charge = charge;
    }

    //Update Bonds that use this Atom (only if x or y has changed)
    if (x != null || y != null) {
        var id = this.id;
        $.each(elements.bonds.list, function(index, item) {
            if (item.atom1ID == id || item.atom2ID == id) {
                this.update();
            }
        });
    }
}
