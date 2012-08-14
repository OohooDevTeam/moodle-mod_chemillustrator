//HTML5 canvas and its context
var canvas, ctx;
//Canvas width and height
var WIDTH, HEIGHT;

//Canvas elements
var elements;
//What is being hovered
var hover;
//Array of what is selected
var selected;

var fontSize = 18;

var currentFileName = 'Untitled';

//Viewport variables
var zoom;
//Where the origin (0,0) point is, NOT what point the upper left is
var origin;

var currentTool;

//Draw the grid?
var gridLines;

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
        atoms: new Elements(),
        bonds: new Elements(),
        arrows: new Elements(),
        rings: new Elements(),
        boxes: new Elements()
    };

    hover = null;

    selected = new Array();
    origin = new Point(0,0);

    zoom = 1.0;

    gridLines = true;
    //Draw all the tool buttons
    currentTool = 'single_bond_tool';

    //Set the defualt tool to the second

    //Cancel the context menu
    canvas.on('contextmenu', function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    //Set up the mouse events
    canvas.on('mousedown', onDown).on('mousewheel', zoomWheel).on('mouseup', onUp).on('mousemove', onMove);

    //Set up the touch events
    //canvas.on('touchstart', onDown).on('touchend', null).on('touchmove', null);

    //Set the ctrl+z script to undo
    var isCtrl = false;
    $(document).on('keyup', function(e) {
        if (e.which == 17) {
            isCtrl=false;
        }
    }).on('keydown' ,function(e) {
        if (e.which == 46 && SelectTool.multiSelect.length > 0) {
            for (var n = 0; n < SelectTool.multiSelect.length; n++) {
                if (SelectTool.multiSelect[n] instanceof Atom) {
                    elements.atoms.remove(SelectTool.multiSelect[n]);
                }
                else if (SelectTool.multiSelect[n] instanceof Arrow) {
                    elements.arrows.remove(SelectTool.multiSelect[n]);
                }
                else if (SelectTool.multiSelect[n] instanceof TextBox) {
                    elements.boxes.remove(SelectTool.multiSelect[n]);
                }
            }
            SelectTool.multiSelect.length = 0;
            redraw();
        }
        else if(e.which == 17) {
            isCtrl=true;
        }
        else if(e.which == 27) {
            SelectTool.multiSelect.length = 0;
            redraw();
        }

        if (e.which == 90 && isCtrl == true) {
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
            return false;
        }
        else if(e.which == 79 && isCtrl == true) {
            new OpenTool(null, null).onSelected();
            return false;
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
        hover.drawCircle('red', 6);
    }
    else {
        if (currentTool instanceof BondTool) {
            $.each(elements.atoms.list.concat(elements.bonds.list), function(index, item) {
                item.drawCircle('green', 4);
            });
        }
        else if (currentTool instanceof MoveTool) {
            $.each(elements.atoms.list.concat(elements.bonds.list).concat(elements.arrows.list), function (index, item) {
                item.drawCircle('green', 4);
                if (item instanceof Arrow) {
                    item.drawEndCircle('green', 4);
                }
            });
        }
        else if (currentTool instanceof ChangeElementTool) {
            $.each(elements.atoms.list, function(index, item) {
                item.drawCircle('green', 4);
            });
        }
        else if (currentTool instanceof ChargeTool) {
            $.each(elements.atoms.list, function(index, item) {
                item.drawCircle('green', 4);
            });
        }
        else if (currentTool instanceof TextTool) {
            $.each(elements.boxes.list, function(index, item) {
                item.drawBorder('green');
            });
            $.each(elements.arrows.list, function(index, item) {
                item.drawCircle('green', 4);
            });
        }
    }

    ctx.restore();

    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(137,0,0,0.1)';

    //draw select
    if (selected != null) {
        ctx.fillRect( (selected.x + origin.x - WIDTH/2)*zoom + WIDTH/2, (selected.y + origin.y - HEIGHT/2)*zoom + HEIGHT/2 , selected.width*zoom, selected.height*zoom);
        ctx.strokeRect( (selected.x + origin.x - WIDTH/2)*zoom + WIDTH/2, (selected.y + origin.y - HEIGHT/2)*zoom + HEIGHT/2 , selected.width*zoom, selected.height*zoom);
    }

    for (var n = 0; n < selected.length ; n++) {
        if (selected[n] instanceof Atom) {
            selected[n].drawCircle('rgba(255,0,0,1)');
        }
        else if (selected[n] instanceof Arrow) {
            ctx.save();
            convertWorldToLocal();
            ctx.beginPath();
            ctx.arc(selected[n].center.x,selected[n].center.y,4,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
        else if (selected[n] instanceof TextBox) {
            ctx.save();
            convertWorldToLocal();
            ctx.strokeRect(selected[n].point.x, selected[n].point.y, selected[n].width, selected[n].height);
            ctx.restore();
        }
    }
}

function onDown(event) {
    event.preventDefault();
    event.stopPropagation();


    if (currentTool != null) {
        $(document).on('mousemove', onMove);

        selected = hover;

        if (event.which == 1 && !(currentTool instanceof PanTool)) {
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
    hover = getCoords(event, true);

    if (event.which == 2 || (currentTool instanceof PanTool && event.which == 1)) {
        new PanTool().onDrag(getCoords(event, false));
    }
    else if (event.which == 1) {
        currentTool.onDrag(getCoords(event, true));
    }

    if (hover != oldHover) {
        redraw();
    }
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

function getCoords(e, snap, touch) {
    var coords = new Point((e.pageX - canvas.offset().left - WIDTH/2)/zoom + WIDTH/2 - origin.x, (e.pageY - canvas.offset().top - HEIGHT/2)/zoom + HEIGHT/2 - origin.y);

    if (snap) {
        if (touch)
            coords.x += 100;

        var r = 10;
        var ans;

        $.each(elements, function(index, item) {
            ans = item.getElementByPoint(coords);

            if (ans != null) {
                return false;
            }
        });

        if (ans != null) {
            return ans;
        }

        return (new Point(Math.snap(coords.x,25), Math.snap(coords.y,25)));
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
        if (response == "Overwrite?") {
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


function Point(x, y) {
    this.x = x;
    this.y = y;
}
Point.prototype.isWithinRadius = function(point, r) {
    if (Math.distance(this, point) <= r)
        return true;

    //If not found, return false
    return false;
}

function Elements() {
    this.list = new Array();
    this.temp = null;
}
Elements.prototype.add = function(element) {
    this.list.push(element);
}
Elements.prototype.getElementByPoint = function(point) {
    var element = null;
    //Loop through all the elements
    $.each(this.list, function(index, item) {
        if (item instanceof Atom) {
            if (item.point.isWithinRadius(point, 5)) {
                element = item;
                //Returning false breaks out of each loop
                return false;
            }
        }
        else if (item instanceof Bond || item instanceof Arrow) {
            if (item.center.isWithinRadius(point, 5)) {
                element = item;
                //Returning false breaks out of each loop
                return false;
            }
            else if (item instanceof Arrow && item.point1.isWithinRadius(point, 5)) {
                element = item.point1;
                //Returning false breaks out of each loop
                return false;
            }
            else if (item instanceof Arrow && item.point2.isWithinRadius(point, 5)) {
                element = item.point2;
                //Returning false breaks out of each loop
                return false;
            }
        }
        else if (item instanceof TextBox) {
            if (item.isWithinRadius(point)) {
                element = item;
                //Returning false breaks out of each loop
                return false;
            }
        }
    });
    return element;
}
Elements.prototype.getElementById = function(id) {
    var element = null;
    //Loop through all the elements
    $.each(this.list, function(index, item) {
        if (item.id == id) {
            element = item;
            //Returning false breaks out of each loop
            return false;
        }
    });
    return element;
}
Elements.prototype.draw = function() {
    //Draw each
    $.each(this.list, function(index, item) {
        item.draw();
    });
    if (this.temp != null) {
        this.temp.draw();
    }
}
Elements.prototype.remove = function(element) {

    }
