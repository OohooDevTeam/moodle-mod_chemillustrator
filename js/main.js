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

//HTML5 canvas and its context
var canvas, ctx;
//Canvas width and height
var WIDTH, HEIGHT;

//Canvas elements
var elements;
//What is being hovered
var hover;
//Array of what is selected
var selected = new Array();
var selectedX = null, selectedY = null, selectedWidth = null, selectedHeight = null;

var fontSize = 18;
var textFontSize = 16;

var currentFileName = 'Untitled';

//Viewport variables
var zoom;
//Where the origin (0,0) point is, NOT what point the upper left is
var origin;

var currentTool = null;

//Draw the grid?
var gridLines = true;

//Stack to keep the undos
var undoStack = new Array();

//Initialize
function init() {
    //Get the canvas and its context
    canvas = $("#canvas");
    ctx = canvas.get(0).getContext('2d');
    //Get the width and height of the canvas, then set them
    WIDTH = canvas.width();
    HEIGHT = canvas.height();
    canvas.attr('width', WIDTH + 'px').attr('height', HEIGHT + 'px');

    elements = {
        atoms: new Element(),
        bonds: new Element(),
        arrows: new Element(),
        rings: new Element(),
        boxes: new Element()
    };

    hover = null;

    origin = new Point(0, 0);

    zoom = 1.0;

    //Cancel the context menu
    canvas.on('contextmenu', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    //Set up the mouse events
    canvas.on('mousedown touchstart', onDown).on('mousewheel', zoomWheel).on('mouseup touchend', onUp).on('mousemove touchmove', onMove);

    //Set the ctrl+z script to undo
    var isCtrl = false;
    $(document).on('keyup', function(e) {
        if (e.which == $.ui.keyCode.CONTROL) {
            isCtrl=false;
        }
    }).on('keydown', function(e) {
        if (e.which == $.ui.keyCode.DELETE && selected.length > 0) {
            for (var n = 0; n < selected.length; n++) {
                if (selected[n] instanceof Atom) {
                    elements.atoms.remove(selected[n]);
                }
                else if (selected[n] instanceof Arrow) {
                    elements.arrows.remove(selected[n]);
                }
                else if (selected[n] instanceof Text) {
                    elements.boxes.remove(selected[n]);
                }
            }
            selected.length = 0;
            redraw();
        }
        else if(e.which == $.ui.keyCode.CONTROL) {
            isCtrl=true;
        }
        else if(e.which == 27) {
            SelectTool.multiSelect.length = 0;
            redraw();
        }
        else if (e.which == 90 && isCtrl == true) {
            new UndoTool().onSelected();
            redraw();
        }
        else if (e.which == 65 && isCtrl == true) {
            SelectTool.multiSelect.length = 0;
            SelectTool.multiSelect = SelectTool.multiSelect.concat(atoms.atomsList);
            SelectTool.multiSelect = SelectTool.multiSelect.concat(arrows.arrowsList);
            SelectTool.multiSelect = SelectTool.multiSelect.concat(boxes.textBoxesList);
            redraw();
            return false;
        }
        else if(e.which == 80 && isCtrl == true) {
            var temp = currentTool;
            currentTool = new PrintTool();
            currentTool.onSelected();
            currentTool = temp;
            redraw();
            return false;
        }
        //'s' key
        else if(e.which == 83 && isCtrl == true) {
            new SaveTool(null, null).onSelected();
            isCtrl = false;
        }
        else if(e.which == 79 && isCtrl == true) {
            new OpenTool(null, null).onSelected();
        }
    });
    //Draw the canvas
    redraw();
}

function clearCanvas() {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gridLines) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#eee";

        convertWorldToLocal();

        ctx.beginPath();
        for(var x = 0; x <= WIDTH; x+= 25) {
            ctx.moveTo( x , 0);
            ctx.lineTo( x , HEIGHT);
        }
        for(var y = 0; y <= HEIGHT; y+= 25) {
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Redraws everything on the canvas
 * @return void
 */
function redraw() {
    clearCanvas();

    ctx.save();
    convertWorldToLocal(0, 0);

    //Draw the elements. Last drawn is on top
    elements.arrows.draw();
    elements.bonds.draw();
    elements.atoms.draw();
    elements.boxes.draw();

    if (hover != null && !(hover instanceof Point)) {
        if (hover.end != null) {
            hover.drawEndBoundary('red', 6, hover.end);
        }
        else {
            hover.drawBoundary('red', 6);
        }
    }
    else {
        if (currentTool instanceof BondTool) {
            $.each(elements.atoms.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
            $.each(elements.bonds.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
        else if (currentTool instanceof MoveTool) {
            $.each(elements.atoms.list, function (index, item) {
                item.drawBoundary('green', 4);
            });
            $.each(elements.bonds.list, function (index, item) {
                item.drawBoundary('green', 4);
            });
            $.each(elements.arrows.list, function (index, item) {
                item.drawEndBoundary('green', 4);
            });
        }
        else if (currentTool instanceof ChangeElementTool) {
            $.each(elements.atoms.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
        else if (currentTool instanceof RingTool) {
            $.each(elements.bonds.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
        else if (currentTool instanceof ChargeTool) {
            $.each(elements.atoms.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
        else if (currentTool instanceof TextTool) {
            $.each(elements.boxes.list, function(index, item) {
                item.drawBoundary('green');
            });
            $.each(elements.arrows.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
        else if (currentTool instanceof ArrowTool) {
            $.each(elements.arrows.list, function(index, item) {
                item.drawBoundary('green', 4);
            });
        }
    }

    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(137, 0, 0, 0.1)';

    //draw select
    if (selected != null) {
        ctx.fillRect( (selectedX + origin.x - WIDTH/2)*zoom + WIDTH/2, (selectedY + origin.y - HEIGHT/2)*zoom + HEIGHT/2 , selectedWidth*zoom, selectedHeight*zoom);
        ctx.strokeRect( (selectedX + origin.x - WIDTH/2)*zoom + WIDTH/2, (selectedY + origin.y - HEIGHT/2)*zoom + HEIGHT/2 , selectedWidth*zoom, selectedHeight*zoom);
    }

    if (selected instanceof Array) {
        for (var n = 0; n < selected.length ; n++) {
            if (selected[n] instanceof Atom) {
                selected[n].drawCircle('rgba(255,0,0,1)', 5);
            }
            else if (selected[n] instanceof Arrow) {
                ctx.save();
                convertWorldToLocal();
                ctx.beginPath();
                ctx.arc(selected[n].center.x, selected[n].center.y, 4, 0, Math.PI*2, true);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }
            else if (selected[n] instanceof Text) {
                ctx.save();
                convertWorldToLocal();
                ctx.strokeRect(selected[n].point.x, selected[n].point.y, selected[n].width, selected[n].height);
                ctx.restore();
            }
        }
    }
    ctx.restore();
}

function onDown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentTool != null) {
        $(document).on('mousemove touchmove', onMove);

        if (event.type == "touchstart") {
            onMove(event);
        }

        selected = hover;

        if ((event.which == 1 || event.type == "touchstart") && !(currentTool instanceof PanTool)) {
            currentTool.onDown(hover);
        }
        else if (event.which == 2 || currentTool instanceof PanTool) {
            new PanTool().onDown(getCoords(event, false));
        }
    }

    redraw();
}
function onMove(event) {
    var oldHover = hover;

    if (currentTool instanceof ArrowTool) {
        var test = getCoords(event, true);
        if (test instanceof Arrow) {
            hover = test;
        }
        else {
            hover = getCoords(event, false);
        }
    }
    else {
        hover = getCoords(event, true);
    }

    if (event.which == 2 || (currentTool instanceof PanTool && event.which == 1)) {
        new PanTool().onDrag(getCoords(event, false));
    }
    else if (event.which == 1 || event.type == "touchmove") {
        if (currentTool instanceof ArrowTool || selected instanceof Arrow) {
            currentTool.onDrag(getCoords(event, false));
        }
        else {
            currentTool.onDrag(getCoords(event, true));
        }
    }

    redraw();

}
function onUp(event) {
    event.preventDefault();
    event.stopPropagation();

    $(document).unbind('mousemove');

    currentTool.onUp(getCoords(event, true));

    redraw();
}
function zoomWheel(event, delta) {
    event.preventDefault();
    event.stopPropagation();

    if (delta > 0 && zoom <= 5.06) {
        var realPos = getCoords(event);

        zoom*=1.5;

        var realPos2 = getCoords(event);

        origin.x += realPos2.x - realPos.x;
        origin.y += realPos2.y - realPos.y;
        redraw();
    }
    else if (delta < 0 && zoom >= 0.444444 ) {
        var realPos = getCoords(event);

        zoom /= 1.5;

        var realPos2 = getCoords(event);

        origin.x += realPos2.x - realPos.x;
        origin.y += realPos2.y - realPos.y;

        redraw();
    }
}

function getCoords(e, snap) {
    var coords = null;
    if (e.type == "touchmove" || e.type == "touchstart") {
        coords = new Point((e.originalEvent.changedTouches[0].pageX - canvas.offset().left - WIDTH/2)/zoom + WIDTH/2 - origin.x, (e.originalEvent.changedTouches[0].pageY - canvas.offset().top - HEIGHT/2)/zoom + HEIGHT/2 - origin.y);
    }
    else {
        coords = new Point((e.pageX - canvas.offset().left - WIDTH/2)/zoom + WIDTH/2 - origin.x, (e.pageY - canvas.offset().top - HEIGHT/2)/zoom + HEIGHT/2 - origin.y);
    }

    if (snap) {
        var ans;

        $.each(elements, function(index, item) {
            if (item instanceof Element) {
                if (e.type == "touchmove" || e.type == "touchstart") {
                    ans = item.getElementByPoint(coords, 15);
                }
                else {
                    ans = item.getElementByPoint(coords, 5);
                }

                if (ans != null && ans != selected && ans.id != 0) {
                    return false;
                }
            }
        });

        if (ans != null) {
            return ans;
        }

        return (new Point(Math.snap(coords.x, 25), Math.snap(coords.y, 25)));
    }
    else
        return coords;
}
function convertWorldToLocal(x, y) {
    if (x == null){
        x = 0;
    }
    if (y == null) {
        y = 0;
    }
    //*ALL transforms are done in reverse order*
    //Move the origin to the center
    ctx.translate(WIDTH/2, HEIGHT/2);
    //Zoom by zoom factor
    ctx.scale(zoom, zoom);
    //Translate into world coordinates
    ctx.translate(origin.x - (WIDTH/2) + x, origin.y - (HEIGHT/2) + y);
}

function save(data, dialogs) {
    $.post('saveFile.php', data, function(response) {
        if (response != "") {
            createOverwritePrompt(save, data, dialogs);
            return;
        }

        $.each(dialogs, function(index, item) {
            item.dialog("close");
        });
    });
}
function createOverwritePrompt(callback, data, dialogs) {
    $("<div>Would you like to overwrite</div>")
    .appendTo('body')
    .dialog({
        resizable: false,
        modal: true,
        title: 'Overwrite',
        close: function() {
            $(this).remove();
        },
        buttons: {
            "Yes": function() {
                $(this).siblings(".ui-dialog-buttonpane").find(".ui-button-text").first().prepend("<img src='icons/loading.gif' style='max-height:12px;max-width:12px;'/>");
                $(this).siblings(".ui-dialog-buttonpane").find("button.ui-button").button("disable");

                data.overwrite = true;
                dialogs.push($(this));
                callback(data, dialogs);
            },
            "No": function() {
                $.each(dialogs, function(index, item) {
                    item.dialog("close");
                });
                $(this).dialog("close");
            }
        }
    });
}

/**
 * Creates a Point object
 *
 * @param x The x coordinate
 * @param y The y coordinate
 * @return void
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Get wether point is withing a radius of this point
 *
 * @param Point point point to test
 * @param number r Radius to check
 * @return boolean True if withing radius, otherwise false
 */
function isWithinRadius(point1, point2, r) {
    if (Math.distance(point1.x, point1.y, point2.x, point2.y) <= r) {
        return true;
    }
    //If not found, return false
    return false;
}


function Element() {
    this.list = {};
    this.id = 1;
}
Element.prototype.add = function(element) {
    element.id = this.id;

    this.list[this.id] = element;
    this.id++;
}
Element.prototype.getElementByPoint = function(point, r) {
    var element = null;
    //Loop through all the elements
    $.each(this.list, function(index, item) {
        if (item instanceof Atom) {
            if (isWithinRadius(new Point(item.x, item.y), point, r) && item.id != 0) {
                element = item;
                //Returning false breaks out of each loop
                return false;
            }
        }
        else if (item instanceof Bond || item instanceof Arrow) {
            if (isWithinRadius(new Point(item.cx, item.cy), point, r)) {
                element = item;
                hover.end = null;
                //Returning false breaks out of each loop
                return false;
            }
            else if (item instanceof Arrow && isWithinRadius(new Point(item.x1, item.y1), point, r)) {
                element = item;
                hover.end = 1;
                //Returning false breaks out of each loop
                return false;
            }
            else if (item instanceof Arrow && isWithinRadius(new Point(item.x2, item.y2), point, r)) {
                element = item;
                hover.end = 2;
                //Returning false breaks out of each loop
                return false;
            }
        }
        else if (item instanceof Text) {
            if (isWithinRadius(item, point)) {
                element = item;
                //Returning false breaks out of each loop
                return false;
            }
        }
    });
    return element;
}
Element.prototype.draw = function() {
    //Draw each
    $.each(this.list, function(index, item) {
        item.draw();
    });
}
Element.prototype.remove = function(element) {
    var list = this.list;
    $(this.list).each(function(index, item) {
        if (item == element) {
            list.splice(index, 1);
            return false;
        }
    });
}

function readData(data) {
    if (data != null) {
        elements = JSON.parse(data);

        $.each(elements, function(index, item) {
            if (index != 'id') {
                var list = item.list;
                var temp = null;
                var id = item.id;

                $.each(list, function(index2, item2) {
                    if (index == 'arrows') {
                        list[index2] = $.extend(new Arrow(), item2);
                    }
                    else if (index == 'boxes') {
                        list[index2] = $.extend(new Text(), item2);
                    }
                    else if (index == 'atoms') {
                        list[index2] = $.extend(new Atom(), item2);
                    }
                    else if (index == 'bonds') {
                        list[index2] = $.extend(new Bond(), item2);
                    }
                });

                elements[index].id = id;
                elements[index] = new Element();
                elements[index].list = list;
            }
        });
    }
}