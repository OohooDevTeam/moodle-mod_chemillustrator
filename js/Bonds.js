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
 * Create a Bond object between atom1 and atom2
 *
 * @param atom1ID First Atom's ID
 * @param atom2ID Second Atom's ID
 * @param type Type of Bond
 * @param ring True if Bond is part of a ring, false if not
 * @return Bond
 */
function Bond(atom1ID, atom2ID, type, ring) {
    this.id = 0;

    //Atoms forming the bond
    this.atom1ID = 0;
    this.atom2ID = 0;

    //Center location
    this.cx = 0;
    this.cy = 0;

    //Bond line
    this.angle = 0;
    this.length = 0;

    //Type of bond
    this.type = 1;

    //If Bond is part of a ring
    this.ring = false;

    //Calculate Bond data
    this.update(atom1ID, atom2ID, type, ring);
}

/**
 * Draw the Bond object
 *
 * @return void
 */
Bond.prototype.draw = function() {
    //Get the Atom from its ID
    var atom1 = elements.atoms.list[this.atom1ID];

    //Save the current canvas state
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.translate(atom1.x, atom1.y);
    ctx.rotate(-this.angle);

    //Draw the types 1, 2 and 3
    if (typeof(this.type) == "number") {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);

        //If bond type is 2 or 3
        if (this.type >= 2) {
            //If part of a ring, draw Bond shorter
            if (this.ring) {
                ctx.moveTo(8, 5);
                ctx.lineTo(this.length - 8, 5);
            }
            else {
                ctx.moveTo(0, 5);
                ctx.lineTo(this.length, 5);
            }

            //If bond type is 3
            if (this.type == 3) {
                //If part of a ring, draw Bond shorter
                if (this.ring) {
                    ctx.moveTo(8, -5);
                    ctx.lineTo(this.length - 8, -5);
                }
                else {
                    ctx.moveTo(0, -5);
                    ctx.lineTo(this.length, -5);
                }
            }
        }
        ctx.stroke();
    }
    //Draw the stereo up type
    else if (this.type == "up") {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, -8);
        ctx.lineTo(this.length, 8);
        ctx.closePath();
        ctx.fill();
    }
    //Draw the stereo down type
    else if (this.type == "down") {
        var partitions = Math.ceil(this.length / 10);
        var dx = this.length / partitions;
        var dy = 8 / partitions;
        ctx.beginPath();
        for (var i = 1; i <= partitions; i++) {
            ctx.moveTo(dx * i, dy * i);
            ctx.lineTo(dx * i, -dy * i);
        }
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Draw a boundary/circle in the middle of the Bond object
 *
 * @param color Color of the boundary/circle
 * @param radius Radius of the boundary/circle
 * @return void
 */
Bond.prototype.drawBoundary = function(color, radius) {
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
 * Update the Bond object's Atoms and/or type and/or ring status
 *
 * @param atom1ID New first Atom ID
 * @param atom2ID New second Atom ID
 * @param type New type of Bond
 * @param ring New ring status (True if part of a ring, false otherwise)
 * @return void
 */
Bond.prototype.update = function(atom1ID, atom2ID, type, ring) {
    if (atom1ID != null) {
        this.atom1ID = atom1ID;
    }
    if (atom2ID != null) {
        this.atom2ID = atom2ID;
    }
    if (type != null) {
        this.type = type;
    }
    if (ring != null) {
        this.ring = ring;
    }

    //Get the Atoms from their IDs
    var atom1 = elements.atoms.list[this.atom1ID];
    var atom2 = elements.atoms.list[this.atom2ID];

    if (atom1 != null && atom2 != null) {
        this.cx = (atom1.x + atom2.x)/2;
        this.cy = (atom1.y + atom2.y)/2;

        this.angle = Math.angle(atom1.x, atom1.y, atom2.x, atom2.y);
        this.length = Math.distance(atom1.x, atom1.y, atom2.x, atom2.y);
    }
}








////////////////////////////////////////////////////////////////////////////////

function follow(atom, trace) {
    trace.push(atom);

    var found = null;
    $(atom.connections).each(function(index, item) {
        //Basecase
        if (trace.length >= 3 && item == trace[0]) {
            found = trace;
            return false;
        }
        else if ($.inArray(item, trace) == -1) {
            found = follow(item, trace.slice(0));
            if (found != null) {
                return false;
            }
        }
    });
    return found;
}

function Ring(sides, center, preset, bondangle, attached) {
    //How many sides
    this.sides = sides;
    //Position
    this.center = center;

    //Temp array of bonds
    this.bonds = new Array();
    //Temp array of atoms
    this.atoms = new Array();

    this.attached = attached;

    this.deflectionangle = bondangle;


    if (bondangle != null) {
        this.bondClicked = bondangle;
        this.bondangle = bondangle.angle;
    }
    else {
        this.bondClicked = null;
        this.bondangle = null;
    }

    if (preset != null) {
        this.preset = preset;
    }
    else {
        this.preset = new Array();
        for (var n = 0; n < sides; n++) {
            this.preset.push(1);
        }
    }


    this.calculate();

    for (var n = 0; n < this.atoms.length; n++) {
        elements.atoms.add(this.atoms[n]);
    }
    for (var n = 0; n < this.bonds.length; n++) {
        elements.bonds.add(this.bonds[n]);
    }
}
Ring.prototype.calculate = function() {
    //Degrees each corner is offset
    var degrees = (this.sides - 2) * Math.PI / this.sides;

    //Calculates the radius so that the sides are of equal length
    var r = 20 / Math.sqrt(Math.pow(Math.sin(Math.PI/this.sides), 2));

    for (var n = 0; n < this.sides; n++) {
        if (n < 2 && this.attached != null) {
            continue;
        }
        var x = this.center.x + (Math.cos((n * (Math.PI - degrees)) + this.deflectionangle) * r);
        var y = this.center.y + (Math.sin((n * (Math.PI - degrees)) + this.deflectionangle) * r);

        this.atoms.push(new Atom(x, y));
    }
    for (var n = 0; n < this.atoms.length; n++) {
        if (this.attached != null) {
            if (n == 0) {
                this.bonds.push(new Bond(this.attached.atom1ID, this.atoms[n], this.preset[this.preset.length - 1], 1, true));
            }
            if (n + 1 < this.atoms.length) {
                this.bonds.push(new Bond(this.atoms[n], this.atoms[n + 1], this.preset[n], 1, true));
            }
            else {
                this.bonds.push(new Bond(this.atoms[n], this.attached.atom2ID, this.preset[n], 1, true));
            }
        }
        else {
            var end = n + 1;
            if (end >= this.atoms.length) {
                end = 0;
            }
            this.bonds.push(new Bond(this.atoms[n], this.atoms[end], this.preset[n], 1, true));
        }
    }

    return;

    //Move the center point if it is on a bond
    if (this.bondangle != null) {
        this.center.x += r*Math.cos(Math.PI/this.sides) * Math.sin(this.bondangle);
        this.center.y += r*Math.cos(Math.PI/this.sides) * Math.cos(this.bondangle);
    }

    var point = $M([
        [this.center.x, this.center.y - r]
        ]);

    point.Rotation(Math.PI/2);

    //var point = Matrix.createPointMatrix(this.center.x, this.center.y-r);
    //Orient the point so it is inline with bond
    //var rotateMatrix = Matrix.createRotateAboutPointMatrix(this.center.x, this.center.y, this.rotation);
    //point = rotateMatrix.multiply(point);

    this.atoms.push(new Atom(parseInt( point[0][0].toFixed(4)) , parseInt( point[1][0].toFixed(4))));

    //Offset/angle the degrees of inner triangle
    rotateMatrix = Matrix.createRotateAboutPointMatrix(this.center.x, this.center.y, -degrees );
    //For each side, starting with the 2nd side
    for (var i = 1; i < this.sides; i++) {
        //Calculate the new point
        point = rotateMatrix.multiply( point);

        if (i==2 && this.bondClicked)
            this.atoms.push(this.bondClicked.atom2ID);
        else if (i==3 && this.bondClicked)
            this.atoms.push(this.bondClicked.atom1ID);
        else
            this.atoms.push(new Atom(parseInt( point[0][0].toFixed(4)) , parseInt( point[1][0].toFixed(4))));


        if (this.bondClicked && i ==3)
            this.bonds.push(this.bondClicked);
        //If there is a preset bond
        else if (this.preset instanceof Array)
            this.bonds.push(new Bond(this.atoms[i-1], this.atoms[i],  "normal" , this.preset[i-1], true));
        //Otherwise default
        else
            this.bonds.push(new Bond(this.atoms[i-1], this.atoms[i],  "normal", 1, true));
    }
    //Connect last to first
    if (this.preset instanceof Array) {
        this.bonds.push(new Bond(this.atoms[this.atoms.length - 1], this.atoms[0], "normal" , this.preset[this.preset.length -1], true));
    }
    else {
        this.bonds.push(new Bond(this.atoms[this.atoms.length - 1], this.atoms[0],  "normal", 1, true));
    }

    var length = this.atoms.length;
    $.each(this.atoms, function(index, item) {
        var last = index - 1;

        if (last == -1)
            last = length -1;

        item.connections = item.connections.concat(new Array(this.bonds[last], this.bonds[index]));
    });

}
