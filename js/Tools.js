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
 * Abstract class for all the tools
 */
function Tool() {}
Tool.prototype.onSelected = function() {}
Tool.prototype.onDown = function() {}
Tool.prototype.onDrag = function() {}
Tool.prototype.onUp = function() {}

/**
 * Tool for creating and editing Arrows
 *
 * @return ArrowTool
 */
function ArrowTool() {}
ArrowTool.prototype = new Tool();
ArrowTool.prototype.onDown = function(e) {
    UndoTool.add();

    if (e instanceof Point) {
        elements.arrows.list[0] = new Arrow(e.x, e.y, e.x, e.y);
    }
}
ArrowTool.prototype.onDrag = function(e) {
    if (elements.arrows.list[0] != null) {
        elements.arrows.list[0].update(null, null, e.x, e.y);
    }
    else if (selected instanceof Arrow && e instanceof Point) {
        var cpy = Math.distance((selected.x1 + selected.x2)/2, (selected.y1 + selected.y2)/2, e.x, e.y);

        if (Math.sin(Math.angle(selected.x1, selected.y1, e.x, e.y) - selected.angle) < 0) {
            cpy *= -1;
        }

        selected.update(null, null, null, null, null, cpy);
    }
}
ArrowTool.prototype.onUp = function() {
    if (elements.arrows.list[0] != null && elements.arrows.list[0].length >= 25) {
        elements.arrows.add(elements.arrows.list[0]);
    }
    else {
        undoStack.pop();
    }

    delete elements.arrows.list[0];
}

/**
 * Tool for creating and editing Bonds
 *
 * @return BondTool
 */
function BondTool(type) {
    this.type = type;
}
BondTool.prototype = new Tool();
BondTool.prototype.onDown = function(e) {
    UndoTool.add();

    if (e instanceof Point) {
        elements.atoms.list[-1] = new Atom(e.x, e.y);
        elements.atoms.list[0] = new Atom(e.x, e.y);
        elements.bonds.list[0] = new Bond(-1, 0, this.type);
    }
    else if (e instanceof Atom) {
        elements.atoms.list[0] = new Atom(e.x, e.y);
        elements.bonds.list[0] = new Bond(e.id, 0, this.type);
    }
    else if (e instanceof Bond) {
        //Switch directions
        if (e.type == this.type) {
            e.update(e.atom2ID, e.atom1ID);
        }
        else {
            e.update(null, null, this.type);
        }
    }
}
BondTool.prototype.onDrag = function(e) {
    if (e instanceof Atom && elements.bonds.list[0] != null) {
        elements.bonds.list[0].update(null, e.id);
    }
    else if (elements.atoms.list[0] != null) {
        elements.bonds.list[0].update(null, 0);
        elements.atoms.list[0].update(e.x, e.y);
    }
}
BondTool.prototype.onUp = function() {
    if (elements.bonds.list[0] != null && elements.bonds.list[0].length >= 25) {
        if (elements.bonds.list[0].atom1ID == -1) {
            elements.atoms.add(elements.atoms.list[-1]);
            elements.bonds.list[0].update(elements.atoms.id - 1);
        }
        if (elements.bonds.list[0].atom2ID == 0) {
            elements.atoms.add(elements.atoms.list[0]);
            elements.bonds.list[0].update(null, elements.atoms.id - 1);
        }

        elements.bonds.add(elements.bonds.list[0]);
    }
    else {
        undoStack.pop();
    }

    delete elements.atoms.list[-1];
    delete elements.atoms.list[0];
    delete elements.bonds.list[0];
}

/**
 * Tool for changing an Atom's element
 *
 * @return ChangeElementTool
 */
function ChangeElementTool(element) {
    this.element = element;
}
ChangeElementTool.prototype = new Tool();
ChangeElementTool.prototype.onDown = function(e) {
    if (e instanceof Atom) {
        UndoTool.add();

        if (this.element != "table") {
            e.element = this.element;
        }
        else {
            $("#PeriodicTable").dialog('open');
        }
    }
}

/**
 * Tool for changing an Atom's charge
 *
 * @return ChargeTool
 */
function ChargeTool(charge) {
    this.charge = charge;
}
ChargeTool.prototype = new Tool();
ChargeTool.prototype.onDown = function(e) {
    if (selected instanceof Atom) {
        UndoTool.add();

        e.charge += this.charge;
    }
}

/**
 * Tool for clearing the workspace
 *
 * @return ClearTool
 */
function ClearTool() {}
ClearTool.prototype = new Tool();
ClearTool.prototype.onSelected = function() {
    UndoTool.add();

    elements.arrows = new Element();
    elements.atoms = new Element();
    elements.bonds = new Element();
    elements.boxes = new Element();
    elements.rings = new Element();
}

/**
 * Tool for erasing an element
 *
 * @return EraserTool
 */
function EraserTool() {}
EraserTool.prototype = new Tool();
EraserTool.prototype.onSelected = function() {
    if (SelectTool.multiSelect.length > 0){
        for (var n = 0; n < SelectTool.multiSelect.length; n++) {
            if (SelectTool.multiSelect[n] instanceof Atom)
                atoms.remove(SelectTool.multiSelect[n]);
            else if (SelectTool.multiSelect[n] instanceof Arrow) {
                arrows.remove(SelectTool.multiSelect[n]);
            }
            else if (SelectTool.multiSelect[n] instanceof Text) {
                boxes.remove(SelectTool.multiSelect[n]);
            }
        }
        SelectTool.multiSelect.length = 0;
        redraw();
    }
}
EraserTool.prototype.onDown = function(e) {
    UndoTool.add();

    if (e instanceof Bond) {
        elements.bonds.list.splice(elements.bonds.list.indexOf(e), 1);
    }
    else if (e instanceof Arrow) {
        elements.arrows.list.splice(elements.arrows.list.indexOf(e), 1);
    }
    else if (e instanceof Atom) {
        $(elements.bonds.list).each(function(index, item) {
            if (item.atom1 == e || item.atom2 == e) {
                elements.bonds.list.splice(elements.bonds.list.indexOf(item), 1);
            }
        });
        delete elements.atoms.list[e.id];

    }
    else if (e instanceof Ring) {
        elements.rings.list.splice(elements.rings.list.indexOf(e), 1);
    }
    else if (e instanceof Text) {
        elements.boxes.list.splice(elements.boxes.list.indexOf(e), 1);
    }
}
////////////////////////////////////////////////////////////////////////////////
function MoveTool() {
    this.selected = null;
    this.newlocation = null;
}
MoveTool.prototype = new Tool();
MoveTool.prototype.onDown = function(selected) {
    if (selected != null) {
        UndoTool.add();
        this.selected = [selected];
    }
}
MoveTool.prototype.onDrag = function(over) {
    if (this.selected != null) {
        $.each(this.selected, function(index, item) {
            if (item instanceof Atom && over instanceof Point) {
                item.update(over.x, over.y);
            }
            else if (item instanceof Arrow && item.end != null && over instanceof Point) {
                if (item.end == 1) {
                    item.update(over.x, over.y);
                }
                else if (item.end == 2) {
                    item.update(null, null, over.x, over.y);
                }
            }
            else if (item instanceof Bond && over instanceof Point) {
                var atom1 = (typeof(item.atom1) == 'number') ? elements.atoms.getElementById(item.atom1) : item.atom1;
                var atom2 = (typeof(item.atom2) == 'number') ? elements.atoms.getElementById(item.atom2) : item.atom2;

                var dx = atom2.x - item.cx;
                var dy = atom2.y - item.cy;


                atom1.update(over.x - dx, over.y - dy);
                atom2.update(over.x + dx, over.y + dy);
            }
            else if (item instanceof Text && over instanceof Point) {
                item.update(over);
            }
        });
    }
}
MoveTool.prototype.onUp = function(e) {
    if (e instanceof Atom && this.selected[0] instanceof Atom && this.selected[0] != e) {
        var temp = this.selected[0];
        $.each(elements.bonds.list, function(index, item) {
            if (item.atom1 == temp) {
                item.atom1 = e;
            }
            else if (item.atom2 == temp) {
                item.atom2 = e;
            }
        });

        $(this.selected[0].connections).each(function(index, item) {
            item.update();
        });

        var n = elements.atoms.list.indexOf(this.selected[0]);
        elements.atoms.list.splice(n, 1);
    }

    this.selected = null;
}
////////////////////////////////////////////////////////////////////////////////
function OpenTool() {}
OpenTool.prototype = new Tool();
OpenTool.prototype.onSelected = function() {
    if (elements.atoms.list.length != 0 && elements.bonds.list.length != 0 && elements.boxes.list.length != 0 && elements.arrows.list.length != 0) {
        $("<div>Are you sure you want to lose all unsaved changes?</div>")
        .appendTo('body')
        .dialog({
            modal: true,
            resizable: false,
            title: 'Confrim',
            close: function() {
                $(this).remove();
            },
            buttons: {
                "Yes": function() {
                    var dialog = $("<div><table><thead><tr><th>Filename</th><th>Last Modified</th><th>Delete</th></tr></thead></table></div>")
                    .appendTo('body')
                    .dialog({
                        modal: true,
                        resizable: false,
                        title: 'Open File',
                        width: 500,
                        close: function() {
                            $(this).remove();
                        },
                        create: function() {
                            $(this).find("table").dataTable({
                                "bFilter": false,
                                "bJQueryUI": true,
                                "bLengthChange": false,
                                "bScrollCollapse": false,
                                "sScrollY": "280px",
                                "bAutoWidth": false,
                                "aaSorting": [[1,'desc']],
                                "aoColumns": [
                                null,
                                null,
                                {
                                    "bSortable": false,
                                    "sDefaultContent": "<input type='image' class='delete_icon' src='icons/delete.png'/>"
                                }],
                                "oLanguage": {
                                    "sEmptyTable": "Sorry, no saves found.",
                                    "sZeroRecords": "No saves with that name were found.",
                                    "sProcessing": "Loading..."
                                },
                                "sAjaxSource": 'getFiles.php',
                                "bProcessing": true
                            }).find("tbody").click(function(event) {
                                var oTable = $(this).parent("table").dataTable();
                                $(oTable.fnSettings().aoData).each(function (){
                                    $(this.nTr).removeClass('row_selected');
                                });

                                if ($(event.target).hasClass('delete_icon')) {
                                    var row = $(event.target).parent().parent();
                                    row.animate({
                                        opacity: 0.45
                                    }, 600);
                                    $.post('deleteFile.php', {
                                        'filename': row.children().first().text()
                                    }, function() {
                                        oTable.fnDeleteRow(row.get(0));
                                    });
                                }
                                else {
                                    $(event.target.parentNode).addClass('row_selected');
                                }
                            }).dblclick(function(event) {
                                elements.atoms.list.length = 0;
                                elements.bonds.list.length = 0;
                                elements.rings.list.length = 0;
                                elements.arrows.list.length = 0;
                                undoStack = new Array();

                                $.post('getSaveData.php', {
                                    'filename' : $(event.target.parentNode).children().first().text()
                                },
                                function(data) {
                                    if (data != "") {
                                        readData(data);
                                        redraw();
                                    }
                                });

                                redraw();

                                dialog.dialog("close");
                            });
                        }
                    });

                    $(this).dialog("close");
                },
                "No": function() {
                    $(this).dialog("close");
                }
            }
        });
    }
    else {
        $.post('getSaveData.php', {
            'filename' : $(event.target.parentNode).children().first().text()
        },
        function(data) {
            if (data != "") {
                readData(data);
                redraw();
            }
        });

        redraw();
    }
}
////////////////////////////////////////////////////////////////////////////////
function PanTool() {}
PanTool.prototype = new Tool();
PanTool.prototype.onDown = function(selected) {
    if (selected instanceof Point) {
        PanTool.click = selected;
        PanTool.original = origin;
    }
}
PanTool.prototype.onDrag = function(over) {
    if (over instanceof Point) {
        origin.x = PanTool.original.x + over.x - PanTool.click.x;
        origin.y = PanTool.original.y + over.y - PanTool.click.y;
    }
}
PanTool.prototype.onUp = function(e) {
    origin.x = Math.round(origin.x);
    origin.y = Math.round(origin.y);
}
////////////////////////////////////////////////////////////////////////////////
function PrintTool() {}
PrintTool.prototype = new Tool();
PrintTool.prototype.onSelected = function() {
    gridLines = false;

    redraw();

    var image = Canvas2Image.saveAsPNG(canvas.get(0), true);

    $("<div style='text-align:center;'><img src='" + image.src + "' class='print_image'/></div>")
    .appendTo('body')
    .dialog({
        modal: true,
        resizable: false,
        title: 'Print Out',
        height: HEIGHT,
        width: WIDTH,
        close: function() {
            $(this).remove();
        },
        buttons: {
            "Download": function() {
                var form = $("<form method='POST' action='savePrint.php'><input type='hidden' name='data'/><input type='hidden' name='filename'/></form>");
                form.children().eq(0).attr('value', image.src);
                form.children().eq(1).attr('value', 'ChemIllustrator-' + currentFileName);

                $(this).append(form);
                form.submit();
                $(this).dialog("close");
            }
        }
    });
    gridLines = true;
}
////////////////////////////////////////////////////////////////////////////////
function ResetTool() {}
ResetTool.prototype = new Tool();
ResetTool.prototype.onSelected = function() {
    UndoTool.add();

    origin = new Point(0, 0);
    zoom = 1.0;
}
////////////////////////////////////////////////////////////////////////////////
function RingTool(sides, bonds) {
    this.sides = sides;
    this.bonds = bonds;
}
RingTool.prototype = new Tool();
RingTool.prototype.onDown = function(selected) {
    UndoTool.add();

    if (selected instanceof Point) {
        elements.rings.add(new Ring(this.sides, selected, this.bonds, -(Math.PI/2)));
    }
    else if (selected instanceof Bond ) {
        var center = new Point(selected.cx, selected.cy);
        var r = 20 / Math.sqrt(Math.pow(Math.sin(Math.PI/this.sides), 2));

        center.x += -r*Math.sin(selected.angle)*Math.cos(Math.PI/this.sides);
        center.y += -r*Math.cos(selected.angle)*Math.cos(Math.PI/this.sides);

        var def = (Math.PI*(this.sides - 2)/(2*this.sides)) - selected.angle;

        elements.rings.add(new Ring(this.sides, center,  this.bonds, def, selected));
    }
}
////////////////////////////////////////////////////////////////////////////////
function SaveTool() {}
SaveTool.prototype = new Tool();
SaveTool.prototype.onSelected = function() {
    $("<div><table><thead><tr><th>Filename</th><th>Last Modified</th><th>Delete</th></tr></thead></table></div>")
    .appendTo('body')
    .dialog({
        modal: true,
        resizable: false,
        title: 'Save File',
        width: 500,
        close: function() {
            $(this).remove();
        },
        create: function() {
            var dialog = $(this);

            var saveRow = $("<tr class='top' style='background-color:grey;'><td colspan='3'><input type='text'/><input type='button' value='Save'/></td></tr>");
            saveRow.find("input[value='Save']").button().click(function() {
                $(this).button("disable");
                save({
                    filename: $(this).siblings().first().val(),
                    data: JSON.stringify(elements)
                }, [dialog]);
            //$(this).button("enable");
            });

            $(this).find("table")
            .data('saverow', saveRow)
            .dataTable({
                "bFilter": false,
                "bJQueryUI": true,
                "bLengthChange": false,
                "bScrollCollapse": false,
                "sScrollY": "310px",
                "bAutoWidth": false,
                "aaSorting": [[1,'desc']],
                "fnDrawCallback": function() {
                    $(this).find("tbody tr").first().before($(this).data('saverow'));
                },
                "fnInitComplete": function() {
                    $(this).find("input[type='text']").focus();
                },
                "aoColumns": [
                null,
                null,
                {
                    "bSortable": false,
                    "sDefaultContent": "<input type='image' class='delete_icon' src='icons/delete.png'/>"
                }],
                "oLanguage": {
                    "sEmptyTable": "Sorry, no saves were found.",
                    "sZeroRecords": "No saves with that name were found.",
                    "sProcessing": "Loading...",
                    "sLoadingRecords": "Please wait - loading..."
                },
                "sAjaxSource": 'getFiles.php',
                "bProcessing": true
            }).find("tbody").click(function(event) {
                if (!$(event.target).closest('tr').hasClass("top")){
                    var oTable = $(this).parent("table").dataTable();
                    $(oTable.fnSettings().aoData).each(function (){
                        $(this.nTr).removeClass('row_selected');
                    });

                    if ($(event.target).hasClass('delete_icon')) {
                        var row = $(event.target).parent().parent();
                        row.animate({
                            opacity: 0.45
                        }, 600);
                        $.post('deleteFile.php', {
                            'filename': row.children().first().text()
                        }, function() {
                            oTable.fnDeleteRow(row.get(0));
                        });
                    }
                    else {
                        var filename = $(event.target).parent().children().first().text();
                        $(event.target).parent().addClass('row_selected');
                        $(this).parent().data('saverow').find("input").first().val(filename);
                    }
                }
            });
        }
    });
}
////////////////////////////////////////////////////////////////////////////////
function SelectTool() {}
SelectTool.prototype = new Tool();
SelectTool.prototype.onSelected = function() {
    selected = null;
}
SelectTool.prototype.onDown = function(selected) {
    if (selected instanceof Point) {
        this.startpoint = selected;
    }

    selectedX = selected.x;
    selectedY = selected.y;
    selectedWidth = 0;
    selectedHeight = 0;
}
SelectTool.prototype.onDrag = function(over) {
    selectedWidth = over.x - this.startpoint.x;
    selectedHeight = over.y - this.startpoint.y;

    selected = new Array();
    if (over instanceof Point) {
        $(elements.atoms.list).each(function(index, item) {
            if (((item.x >= selectedX && item.x <= over.x) || (item.x <= selectedX && item.x >= over.x)) && ((item.y >= selectedY && item.y <= over.y) || (item.y <= selectedY && item.y >= over.y))) {
                selected.push(item);
            }
        });
        $(elements.arrows.list).each(function(index, item) {
            if (((item.cx >= selectedX && item.cx <= over.x) || (item.cx <= selectedX && item.cx >= over.x)) && ((item.cy >= selectedY && item.cy <= over.y) || (item.cy <= selectedY && item.cy >= over.y))) {
                selected.push(item);
            }
        });
        $(elements.boxes.list).each(function(index, item) {
            if (((item.x >= selectedX && item.x <= over.x) || (item.x <= selectedX && item.x >= over.x)) && ((item.y >= selectedY && item.y <= over.y) || (item.y <= selectedY && item.y >= over.y))) {
                selected.push(item);
            }
        });
    }
}
SelectTool.prototype.onUp = function() {
    selectedX = null;
    selectedY = null;
    selectedWidth = null;
    selectedHeight = null;
}
////////////////////////////////////////////////////////////////////////////////
function TextTool() {
    this.selected = null;
    this.link = $("<input />");
}
TextTool.prototype = new Tool();
TextTool.prototype.onDown = function(sel) {
    UndoTool.add();

    if (sel instanceof Arrow) {
        $("#TextPrompt input").val(sel.text);
        $("#TextPrompt").dialog('open');
    }
    else if (sel instanceof Atom) {
        $("#TextPrompt input").val(sel.element);
        $("#TextPrompt").dialog('open');

        this.selected = sel;
    }
    else if (sel instanceof Point) {
        selected = new Text(sel.x, sel.y);

        $("#TextPrompt").dialog('open');
        elements.boxes.add(selected);
    }
    else if (sel instanceof Text) {
        $("#TextPrompt input").val(sel.text);
        $("#TextPrompt").dialog('open');
    }
}
////////////////////////////////////////////////////////////////////////////////
function UndoTool() {}
UndoTool.prototype = new Tool();
UndoTool.prototype.onSelected = function() {
    var undo = undoStack.pop();

    readData(undo);

    redraw();
}
UndoTool.add = function() {
    if (undoStack.length >= 15) {
        undoStack.shift();
    }

    undoStack.push(JSON.stringify(elements));
}
////////////////////////////////////////////////////////////////////////////////
function ZoomTool(scale) {
    this.scale = scale;
}
ZoomTool.prototype = new Tool();
ZoomTool.prototype.onSelected = function(point) {
    zoom *= this.scale;

    if (zoom <= 0.444444 || zoom >= 5.06)
        zoom /= this.scale;
}
