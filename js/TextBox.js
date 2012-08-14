function TextBox(point) {
    //The location point
    this.point = point;

    //The text to display
    this.text = "";


    this.font = "12px sans-serif";

    //Get the max width of the needed box
    this.width = null
    //Get the height of the needed box
    this.height = null
}
TextBox.prototype.draw = function() {
    //Save the current canvas state
    ctx.save();

    //Baseline set at the top
    ctx.textBaseline = "top";
    //Align the text left
    ctx.textAlign = "left";
    //Font 12px high, sans-serif
    ctx.font = this.font;

    //Convert world coordinates to local
    convertWorldToLocal(this.point.x, this.point.y);

    //Clear the background for the text
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#382D2C';

    //Loop through all the lines

    if (this.text.indexOf('_') > 0) {
        var temp = this.text.split("_");
        var subOffset = 0;

        for (var i = 0; i < temp.length; i+=2) {
            ctx.fillText(temp[i], subOffset, 0);
            subOffset += ctx.measureText(temp[i]).width;

            if (i+1 < temp.length) {
                ctx.save();
                temp.splice(i+2, 0,  temp[i+1].substring(1));
                temp[i+1] = temp[i+1].substr(0, 1);

                ctx.font = "6px sans-serif";
                ctx.textBaseline="bottom";
                ctx.fillText(temp[i+1], subOffset, 16);
                subOffset += ctx.measureText(temp[i+1]).width;
                ctx.restore();
            }
        }
    }
    else if (this.text.indexOf('^') > 0) {
        var temp = this.text.split("^");
        var subOffset = 0;

        for (var i = 0; i < temp.length; i+=2) {
            ctx.fillText(temp[i], subOffset,n*12);
            subOffset += ctx.measureText(temp[i]).width;

            if (i+1 < temp.length) {
                ctx.save();
                temp.splice(i+2, 0,  temp[i+1].substring(1));
                temp[i+1] = temp[i+1].substr(0, 1);

                ctx.font = "6px sans-serif";
                ctx.textBaseline="bottom";
                ctx.fillText(temp[i+1], subOffset, n*12 +4);
                subOffset += ctx.measureText(temp[i+1]).width;
                ctx.restore();
            }
        }
    }
    else {
        ctx.fillText(this.text, 0, 0);
    }


    ctx.restore();
}
TextBox.prototype.update = function(point, text) {
    if (point != null) {
        this.point = point;
    }
    if (text != null) {
        this.text = text;
        this.width = Math.textWidth(text, this.font);
        this.height = 12;
    }
}
TextBox.prototype.drawBorder = function(color) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.strokeRect(this.point.x, this.point.y, this.width, this.height);
    //Restore the state
    ctx.restore();
}
TextBox.prototype.isWithinRadius = function(point) {
    if (point.x > this.point.x && point.x < this.point.x + this.width &&
        point.y > this.point.y && point.y < this.point.y + this.height) {
        return true;
    }

    //If not found, return false
    return false;
}
/////////////////////////////////////////////
