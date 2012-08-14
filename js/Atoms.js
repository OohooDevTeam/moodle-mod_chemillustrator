function Atom(point) {
    //The point where the atom is
    this.point = point;

    //The element of the atom
    //this.element = $("#element_tool").next().find("img").attr('src');
    this.element = "C";

    //The charge on the atom
    this.charge = 0;

     //The atoms this atom is connected to
    this.connections = new Array();
}
Atom.prototype.shift = function(point) {
    this.point.x += point.x;
    this.point.y += point.y;
}
Atom.prototype.update = function(point) {
    if (point != null) {
        this.point = point;
    }
    var atom = this;
    $(elements.bonds.list).each(function(index, item) {
        if (item.atom1 == atom || item.atom2 == atom) {
            this.update();
        }
    });
}
Atom.prototype.drawCircle = function(color, radius) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(this.point.x, this.point.y, radius, 0, 2*Math.PI);
    ctx.stroke();
    //Restore the state
    ctx.restore();
}
Atom.prototype.draw = function() {
    ctx.save();

    var width = 0;

    //If the element is not the standard carbon, draw the element label
    if (this.element != "C") {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = fontSize + "px sans-serif";
        ctx.fillStyle = 'white';

        width = ctx.measureText(this.element).width;

        ctx.fillRect(this.point.x - (width/2), this.point.y - (fontSize/2), width , fontSize - 2);

        ctx.fillStyle = 'black';
        ctx.fillText(this.element, this.point.x, this.point.y);
    }

    //If the charge isn't 0
    if (this.charge != 0) {
        var sign;
        if (this.charge > 0)
            sign = "+";
        else
            sign = "-";

        var number = Math.abs(this.charge);

        if (number == 1)
            number = "";

        var signText =  number + sign;

        var height = fontSize/2;

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = height.toString() +"px sans-serif";
        ctx.fillStyle = 'white';

        var width2 = ctx.measureText(signText).width;

        ctx.fillRect((width/2), - 12 , width2 , height);

        ctx.fillStyle = 'black';

        ctx.fillText(signText, this.point.x - (width / 2), this.point.y - 12);
    }
    ctx.restore();
}
