function Arrow(p1, p2, ctrlP) {
    //The text attached to the arrow
    this.text = null;
    //The arrow points
    this.point1 = new ArrowPoint(p1);
    if (p2 != null) {
        this.point2 = new ArrowPoint(p2);
    }
    else {
        this.point2 = null;
    }

    //Data
    this.length = null;
    this.angle = null;
    this.center = null;

    //The y of the control point
    this.cpy = 0;

    //Calculate data
    this.update(p1, p2, ctrlP);

    //The angle the tip should be at
    this.tipAngle = null;
}
Arrow.prototype.update = function(p1, p2, ctrlP, text) {
    //If p1 isn't null, update it
    if (p1 != null) {
        this.point1 = new ArrowPoint(p1);
    }
    //If p2 isn't null, update it
    if (p2 != null) {
        this.point2 = new ArrowPoint(p2);
    }
    //If text isn't null, update it
    if (text != null) {
        this.text = text;
    }

    //Recalculate
    if (this.point1 != null && this.point2 != null) {
        this.length =  Math.distance(this.point1, this.point2);
        this.angle = Math.angle(this.point1, this.point2);
        this.center = Math.center(this.point1, this.point2);

        if (ctrlP != null) {
            this.cpy = Math.distance(this.center, ctrlP);
            if (Math.sin(Math.angle(this.point1, ctrlP) - this.angle) > 0) {
                this.cpy *= -1;
            }
            var dx = Math.sin(this.angle)*this.cpy;
            var dy = Math.cos(this.angle)*this.cpy;
            this.center.x += dx;
            this.center.y += dy;
            this.tipAngle = Math.angle(new Point(this.center.x, this.center.y + dy), this.point2) - this.angle;
        }
    }
    else {
        this.length =  0;
        this.angle = 0;
        this.center = this.point1;
        this.tipAngle = 0;
    }
}
Arrow.prototype.drawCircle = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}
Arrow.prototype.drawEndCircle = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.point1.x, this.point1.y, radius, 0, 2*Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.point2.x, this.point2.y, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}
Arrow.prototype.draw = function() {
    //Save the current canvas state
    ctx.save();
    //Draw the arrow's line
    ctx.strokeStyle = "black";
    ctx.translate(this.point1.x, this.point1.y);
    ctx.rotate(-this.angle);
    ctx.beginPath();
    ctx.moveTo(0,0);
    if (this.cpy == 0) {
        ctx.lineTo(this.length, 0);
    }
    else {
        ctx.quadraticCurveTo(this.length / 2, 2 * this.cpy, this.length, 0);
    }
    ctx.stroke();
    ctx.fillStyle = "black";
    if (this.text != null) {
        ctx.textBaseline = "bottom";
        var width = ctx.measureText(this.text).width;
        if (this.angle <= Math.PI/2 || this.angle >= 3*Math.PI/2) {
            ctx.fillText(this.text, (this.length - width)/2, this.cpy);
        }
        else {
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.fillText(this.text, -(this.length + width)/2, -this.cpy);
            ctx.restore();
        }
    }

    //Draw the arrow's tip
    ctx.translate(this.length, 0);
    if (this.cpy != 0) {
        ctx.rotate(-this.tipAngle);
    }

    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-8, 8);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function ArrowPoint(point) {
    this.x = point.x;
    this.y = point.y;
}
ArrowPoint.prototype.isWithinRadius = function(point, r) {
    if (Math.distance(this, point) <= r)
        return true;

    //If not found, return false
    return false;
}