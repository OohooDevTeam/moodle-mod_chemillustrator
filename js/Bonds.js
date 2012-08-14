function Bond(atom1, atom2, type, number, ringBond) {
    //The 2 atoms between a bond
    this.atom1 = atom1;
    this.atom2 = atom2;
    this.id;
    //Data
    this.center;
    this.length;
    this.angle;
    //Calculate data with null null because we already defined atom1 and atom2
    this.update(null, null);

    //The type of bond
    this.type = type;
    //If its normal, then number is order of bond
    if (typeof(this.type) == "number") {
        this.number = this.type;
        this.type = "normal";
    }
    else {
        this.number = 1;
    }


    if (!ringBond) {
        this.ringBond = false;
    }
    else {
        this.ringBond = true;
    }
}
Bond.prototype.update = function(atom1, atom2) {
    //If atom1 isn't null
    if (atom1 != null) {
        this.atom1 = atom1;
    }
    //If atom2 isn't null
    if (atom2 != null) {
        this.atom2 = atom2;
    }

    //If atom1 and atom2 are defined, recalculate
    if (this.atom1 && this.atom2) {
        this.angle = Math.angle(this.atom1.point, this.atom2.point);
        this.center = Math.center(this.atom1.point, this.atom2.point);
        this.length = Math.distance(this.atom1.point, this.atom2.point);
    }
    else {
        this.angle = 0;
        this.center = null;
        this.length = 0;
    }
}
Bond.prototype.draw = function() {
    ctx.save();
    ctx.lineWidth = 1.5;

    ctx.strokeStyle = "black";


    ctx.translate(this.atom1.point.x, this.atom1.point.y);
    ctx.rotate( -this.angle );

    if (this.type == "normal") {
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(this.length,0);

        if (this.number > 1) {
            //Draw shorter
            if (this.ringBond) {
                ctx.moveTo(8,-5);
                ctx.lineTo(this.length-8,-5);
            }
            //Draw full length
            else {
                ctx.moveTo(0,-5);
                ctx.lineTo(this.length,-5);
            }

            if (this.number > 2) {
                //Draw shorter
                if (this.ringBond) {
                    ctx.moveTo(8,5);
                    ctx.lineTo(this.length-8, 5);
                }
                //Draw full length
                else {
                    ctx.moveTo(0,5);
                    ctx.lineTo(this.length, 5);
                }
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    else if (this.type == "up") {
        this.drawStereoUp();
    }
    else if (this.type == "down") {
        this.drawStereoDown();
    }
    ctx.restore();
}
Bond.prototype.drawStereoUp = function() {
    ctx.fillStyle = 'black';

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(this.length, -8);
    ctx.lineTo(this.length, 8);
    ctx.lineTo(0,0);

    ctx.closePath();
    ctx.fill();
}
Bond.prototype.drawStereoDown = function() {
    var partitions = Math.ceil(this.length / 10);
    var dx = this.length/partitions;
    var dy = 8/partitions;

    ctx.beginPath();
    for (var i = 1; i <= partitions; i++) {
        ctx.moveTo(dx*i,dy*i);
        ctx.lineTo(dx*i, -dy*i);
    }
    ctx.closePath();
    ctx.stroke();
}
Bond.prototype.drawCircle = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}
////////////////////////////////////////////////////////////////

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


function Ring(sides, center, preset, rotation, bondangle) {
    //The ID of the ring
    this.id = null;
    //How many sides
    this.sides = sides;
    //Position
    this.center = center;

    //Temp array of bonds
    this.bonds = new Array();
    //Temp array of atoms
    this.atoms = new Array();

    if (bondangle)
        this.bondClicked = bondangle;
    else
        this.bondClicked = null;

    if (bondangle)
        this.bondangle = bondangle.angle;
    else
        this.bondangle = null;

    this.preset = preset;

    if (rotation != null)
        this.rotation = rotation
    else
        this.rotation = 0;

    this.calculate();

    for (var n = 0; n < this.atoms.length; n++) {
        elements.atoms.add(this.atoms[n]);
    }
    for (var n = 0; n < this.bonds.length; n++) {
        elements.bonds.add(this.bonds[n]);
    }
}
function RingShape(atomsArray) {
    this.atoms = atomsArray.slice(0,atomsArray.length -1);
    this.sides = this.atoms.length;
    this.points = new Array();
    for (var i = 0; i < this.atoms.length; i++)
        this.points.push(this.atoms[i].point);

    this.center = Math.center(this.points);

    this.bonds = null;
}
Ring.prototype.calculate = function() {
    //Degrees each corner is offset
    var degrees = Math.PI*2 / this.sides;

    //Calculates the radius so that the sides are of equal length
    var r = Math.sqrt((40*40)/(2*(1-Math.cos(Math.PI*2/this.sides))));

    //Move the center point if it is on a bond
    if (this.bondangle != null) {
        this.center.x += r*Math.cos(Math.PI/this.sides) * Math.sin(this.bondangle);
        this.center.y += r*Math.cos(Math.PI/this.sides)* Math.cos(this.bondangle);
    }

    var point = $M([
        [this.center.x, this.center.y - r]
        ]);

    var point = Matrix.createPointMatrix(this.center.x, this.center.y-r);
    //Orient the point so it is inline with bond
    var rotateMatrix = Matrix.createRotateAboutPointMatrix(this.center.x, this.center.y, this.rotation);
    point = rotateMatrix.multiply(point);

    this.atoms.push(new Atom(new Point( parseInt( point[0][0].toFixed(4)) , parseInt( point[1][0].toFixed(4)))));

    //Offset/angle the degrees of inner triangle
    rotateMatrix = Matrix.createRotateAboutPointMatrix(this.center.x, this.center.y, -degrees );
    //For each side, starting with the 2nd side
    for (var i =1; i < this.sides; i++) {
        //Calculate the new point
        point = rotateMatrix.multiply( point);

        if (i==2 && this.bondClicked)
            this.atoms.push(this.bondClicked.atom2);
        else if (i==3 && this.bondClicked)
            this.atoms.push(this.bondClicked.atom1);
        else
            this.atoms.push(new Atom(new Point( parseInt( point[0][0].toFixed(4)) , parseInt( point[1][0].toFixed(4)) )));


        if (this.bondClicked && i ==3)
            this.bonds.push(this.bondClicked);
        //If there is a preset bond
        else if (this.preset instanceof Array)
            this.bonds.push(new Bond(this.atoms[i-1], this.atoms[i],  "normal" ,this.preset[i-1], true));
        //Otherwise default
        else
            this.bonds.push(new Bond(this.atoms[i-1], this.atoms[i],  "normal", 1, true));
    }
    //Connect last to first
    if (this.preset instanceof Array)
        this.bonds.push(new Bond(this.atoms[this.atoms.length - 1], this.atoms[0], "normal" , this.preset[this.preset.length -1], true));
    else
        this.bonds.push(new Bond(this.atoms[this.atoms.length - 1], this.atoms[0],  "normal", 1, true));

    var length = this.atoms.length;
    $.each(this.atoms, function(index, item) {
        var last = index - 1;

        if (last == -1)
            last = length -1;

        item.connections = item.connections.concat(new Array(this.bonds[last], this.bonds[index]));
    });

}
Ring.prototype.move = function(point) {
    //DOING this because it would grab one of its atom as a point... bad
    var dx = point.x - this.center.x;
    var dy = point.y - this.center.y;

    if ((dx != 0 || dy != 0)) {
        for (var n = 0; n < this.atoms.length; n++) {
            this.atoms[n].point.x += dx;
            this.atoms[n].point.y += dy;

            for (var j = 0; j < this.atoms[n].connections.length; j++)
                this.atoms[n].connections[j].update();
        }
        this.center = point;
    }
}
