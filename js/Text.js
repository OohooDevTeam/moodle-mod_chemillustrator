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
 * Create a Text object at the location (x, y)
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param text The text
 * @return Text
 */
function Text(x, y, text) {
    this.id = 0;

    //Location
    this.x = 0;
    this.y = 0;

    //Text to display
    this.text = "";

    //Width and height
    this.width = 0;
    this.height = 0;

    //Calculate Text data
    this.update(x, y, text);
}

/**
 * Draw the Text object
 *
 * @return void
 */
Text.prototype.draw = function() {
    //Save the current canvas state
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = textFontSize + "px sans-serif";

    //Draw a white background behind text
    ctx.fillStyle = "white";
    ctx.fillRect(this.x - this.width/2, this.y -this.height/2, this.width, this.height);

    //Draw the text
    ctx.fillStyle = "black";
    var x = this.x - this.width/2;
    var y = this.y;
    //Search for subscript and superscript elements
    $(this.text.match(new RegExp("(_[^\\s]|\\^[^\\s]|[^_\\^]+)", 'g'))).each(function(index, item) {
        //Subscript
        if (item[0] == '_') {
            ctx.save();
            ctx.font = textFontSize/2 + "px sans-serif";
            ctx.fillText(item[1], x, y + textFontSize/4);
            x += ctx.measureText(item[1]).width;
            ctx.restore();
        }
        //Superscript
        else if (item[0] == '^') {
            ctx.save();
            ctx.font = textFontSize/2 + "px sans-serif";
            ctx.fillText(item[1], x, y - textFontSize/4);
            x += ctx.measureText(item[1]).width;
            ctx.restore();
        }
        else {
            ctx.fillText(item, x, y);
            x += ctx.measureText(item).width;
        }
    });

    ctx.restore();
}

/**
 * Draw a boundary/border around the Text object
 *
 * @param color Color of the boundary/border
 * @return void
 */
Text.prototype.drawBoundary = function(color) {
    //Save the current state
    ctx.save();
    ctx.strokeStyle = color;
    ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    //Restore the state
    ctx.restore();
}

/**
 * Update the Text object's location and/or text
 *
 * @param x New x location
 * @param y New y location
 * @param text New text
 * @return void
 */
Text.prototype.update = function(x, y, text) {
    if (x != null) {
        this.x = x;
    }
    if (y != null) {
        this.y = y;
    }
    if (text != null) {
        this.text = text;

        var width = 0;
        ctx.save();
        ctx.font = textFontSize + "px sans-serif";
        //Search for subscript and superscript elements
        $.each(text.match(new RegExp("(_[^\\s]|\\^[^\\s]|[^_\\^]+)", 'g')), function(index, item) {
            //Subscript or superscript
            if (item[0] == '_' || item[0] == '^') {
                ctx.save();
                ctx.font = textFontSize/2 + "px sans-serif";
                width += ctx.measureText(item[1]).width;
                ctx.restore();
            }
            else {
                width += ctx.measureText(item).width;
            }
        });
        ctx.restore();

        this.width = width;
        this.height = textFontSize;
    }
}

/**
 * Test if location is within the Text object's boundaries
 *
 * @param x X location
 * @param y Y location
 * @return True if within, false if not
 */
Text.prototype.withinBoundary = function(x, y) {
    if (x > this.x - this.width/2 && x < this.x + this.width/2 && y > this.y - this.height/2 && y < this.y + this.height/2) {
        return true;
    }
    return false;
}
