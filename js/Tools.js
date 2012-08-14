function Tool() {}
Tool.prototype.onDown = function(selected) {}
Tool.prototype.onUp = function(e) {}
Tool.prototype.onDrag = function(over) {}
Tool.prototype.onSelected = function() {}
////////////////////////////////////////////////////////////////////////////////
function ArrowTool() {
}
ArrowTool.prototype = new Tool();
ArrowTool.prototype.onDown = function(selected) {
    elements.arrows.temp = new Arrow(selected);
}
ArrowTool.prototype.onUp = function() {
    UndoTool.add();

    if (elements.arrows.temp.length > 15) {
        elements.arrows.add(elements.arrows.temp);
    }
    elements.arrows.temp = null;


}
ArrowTool.prototype.onDrag = function(over) {
    if (elements.arrows.temp != null) {
        elements.arrows.temp.update(null, over);
    }
}
////////////////////////////////////////////////////////////////////////////////
function ChangeElementTool(element, table) {
    this.element = element;
    if (table != null) {
        this.table = table;
    }
    else {
        this.table = false;
    }
}
ChangeElementTool.prototype = new Tool();
ChangeElementTool.prototype.onSelected = function() {
    if (this.table) {
        $("#PeriodicTable").dialog('open');
    }
}
ChangeElementTool.prototype.onDown = function(selected) {
    UndoTool.add();
    selected.element = this.element;
}
////////////////////////////////////////////////////////////////////////////////
function ChargeTool(charge) {
    this.charge = charge;
}
ChargeTool.prototype.onDown = function(selected) {
    if (selected instanceof Atom) {
        //UndoTool.list.push("ac" + selected.id + '|' + selected.charge);
        selected.charge += this.charge;
    }
}
ChargeTool.prototype.onDrag = function() {
    }
ChargeTool.prototype.onUp = function() {
    }
////////////////////////////////////////////////////////////////////////////////
function ClearTool() {}
ClearTool.prototype.onSelected = function() {
    elements.atoms = new Elements();
    elements.bonds = new Elements();
    elements.arrows = new Elements();
    elements.rings = new Elements();
    elements.boxes = new Elements();

    var i = 0;
    while (rings.ringsList.length > 0) {
        ClearTool.undo.push(rings.ringsList.pop());
        i++;
    }
    while (bonds.bondsList.length > 0) {
        ClearTool.undo.push(bonds.bondsList.pop());
        i++;
    }
    while (atoms.atomsList.length > 0) {
        ClearTool.undo.push(atoms.atomsList.pop());
        i++;
    }
    while (arrows.arrowsList.length > 0) {
        ClearTool.undo.push(arrows.arrowsList.pop());
        i++;
    }
    while (boxes.textBoxesList.length > 0) {
        ClearTool.undo.push(boxes.textBoxesList.pop());
        i++;
    }
    UndoTool.list.push("cl" + i);
}
////////////////////////////////////////////////////////////////////////////////
function EraseTool(name, iconsrc, menu) {
    Tool.call(this,name,iconsrc, menu);
}
EraseTool.prototype = new Tool();
EraseTool.prototype.onDown = function(selected) {
    if (selected instanceof Bond)
        bonds.remove(selected);
    else if (selected instanceof Arrow)
        arrows.remove(selected);
    else if (selected instanceof Atom) {
        ClearTool.undo.push(selected);
        UndoTool.list.push('e');
        atoms.remove(selected);
    }
    else if (selected instanceof Ring)
        rings.remove(selected);
    else if (selected instanceof TextBox)
        boxes.remove(selected);
}
EraseTool.prototype.onSelected = function() {
    if (SelectTool.multiSelect.length > 0){
        for (var n = 0; n < SelectTool.multiSelect.length; n++) {
            if (SelectTool.multiSelect[n] instanceof Atom)
                atoms.remove(SelectTool.multiSelect[n]);
            else if (SelectTool.multiSelect[n] instanceof Arrow)
                arrows.remove(SelectTool.multiSelect[n]);
            else if (SelectTool.multiSelect[n] instanceof TextBox)
                boxes.remove(SelectTool.multiSelect[n]);

        }
        SelectTool.multiSelect.length = 0;
        redraw();
        return false;
    }
}
////////////////////////////////////////////////////////////////////////////////
function OpenTool(name, iconsrc, menu) {
    Tool.call(this,name,iconsrc, menu);
}
OpenTool.prototype = new Tool();
OpenTool.prototype.onSelected = function() {
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

                            $.post('getSaveData.php', {
                                'filename' : $(event.target.parentNode).children().first().text()
                            },
                            function(data) {
                                MOLFile.read(data);
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
////////////////////////////////////////////////////////////////////////////////
function PanTool() {
    PanTool.click;
    PanTool.original;
}
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
PrintTool.prototype.onSelected = function() {
    gridLines = false;

    redraw();

    var image = Canvas2Image.saveAsPNG(canvas.get(0), true);

    $("<div><img src='" + image.src + "' class='print_image'/></div>")
    .appendTo('body')
    .dialog({
        modal: true,
        resizable: false,
        title: 'Print Out',
        width: 600,
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
ResetTool.prototype.onSelected = function() {
    origin = new Point(0,0);
    zoom = 1.0;
}
////////////////////////////////////////////////////////////////////////////////
function RingTool(sides, bonds) {
    this.sides = sides;
    this.bonds = bonds;
}
RingTool.prototype.onDown = function(selected) {
    var deflectionAngle = null;

    if (this.sides % 2 == 0) {
        deflectionAngle = Math.PI/2 - selected.angle + Math.PI*2/this.sides;
    }
    else {
        deflectionAngle = Math.PI - selected.angle;
    }

    if (selected instanceof Bond) {
        elements.rings.add(new Ring(this.sides, selected.center,  this.bonds,  deflectionAngle, selected));
    }
    else if (selected instanceof Point) {
        elements.rings.add(new Ring(this.sides, selected, this.bonds));
    }
}
////////////////////////////////////////////////////////////////////////////////
function SaveTool(name, iconsrc, menu) {
    Tool.call(this,name,iconsrc, menu);
}
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
                    data: MOLFile.save('name')
                }, [dialog]);
            //$(this).button("enable");
            });

            $(this).find("table")
            .data('saverow', saveRow)
            .dataTable({
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
function SelectTool(name, iconsrc, menu) {
    Tool.call(this,name,iconsrc, menu);
    SelectTool.multiSelect = new Array();
}
SelectTool.prototype = new Tool();
SelectTool.prototype.onSelected = function() {
    SelectTool.multiSelect.length = 0;
}
SelectTool.prototype.onDown = function(selected) {
    if (selected instanceof Point)
        this.startpoint = selected;
}
SelectTool.prototype.onDrag = function(over) {
    SelectTool.multiSelect = new Array();

    selected = {
        x: this.startpoint.x,
        y:this.startpoint.y,
        width: over.x - this.startpoint.x,
        height:  over.y - this.startpoint.y
    }

    if (over instanceof Point) {
        for (var n = 0; n < elements.atoms.atomsList.length; n++) {
            var temp = elements.atoms.atomsList[n].point;

            if ( ((temp.x >= this.startpoint.x && temp.x <= over.x) || (temp.x <= this.startpoint.x && temp.x >= over.x)) && ((temp.y >= this.startpoint.y && temp.y <= over.y) || (temp.y <= this.startpoint.y && temp.y >= over.y)) )
                SelectTool.multiSelect.push(elements.atoms.atomsList[n]);
        }

        for (var n = 0; n < elements.arrows.arrowsList.length; n++) {
            var temp = elements.arrows.arrowsList[n].center;

            if ( ((temp.x >= this.startpoint.x && temp.x <= over.x) || (temp.x <= this.startpoint.x && temp.x >= over.x)) && ((temp.y >= this.startpoint.y && temp.y <= over.y) || (temp.y <= this.startpoint.y && temp.y >= over.y)) )
                SelectTool.multiSelect.push(elements.arrows.arrowsList[n]);
        }

        for (var n = 0; n < elements.boxes.textBoxesList.length; n++) {
            var temp = elements.boxes.textBoxesList[n].point;

            if ( ((temp.x >= this.startpoint.x && temp.x <= over.x) || (temp.x <= this.startpoint.x && temp.x >= over.x)) && ((temp.y >= this.startpoint.y && temp.y <= over.y) || (temp.y <= this.startpoint.y && temp.y >= over.y)) )
                SelectTool.multiSelect.push(elements.boxes.textBoxesList[n]);
        }
    }
}
SelectTool.prototype.onUp = function() {
    selected = null;
}
////////////////////////////////////////////////////////////////////////////////
function TextTool() {
    this.selected = null;
    this.link = $("<input />");
}
TextTool.prototype = new Tool();
TextTool.prototype.onDown = function(sel) {
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
        selected = new TextBox(sel);
        elements.boxes.add(selected);
        $("#TextPrompt input").val(selected.text);
        $("#TextPrompt").dialog('open');
    }
    else if (sel instanceof TextBox) {
        $("#TextPrompt input").val(sel.text);
        $("#TextPrompt").dialog('open');
    }
}
TextTool.validate = function() {
    sss.element = document.getElementById('textin').value;
    document.getElementById('canvasarea').removeChild(document.getElementById('textin'));

    redraw();
}
////////////////////////////////////////////////////////////////////////////////
function UndoTool() {
    UndoTool.list = new Array();
    UndoTool.temp = null;
}
UndoTool.prototype = new Tool();
UndoTool.prototype.onSelected = function() {
    var undo = undoStack.pop();

    if (undo != null) {
        elements = undo;
    }
    redraw();

    return;


    var action = UndoTool.list.pop();

    if (action != null) {
        var type = action.charAt(0);
        var which = action.charAt(1);

        if (type == 'a') {
            if (which == 'a')
                atoms.remove(atoms.atomsList[atoms.atomsList.length -1]);
            else if (which == 'b')
                bonds.remove(bonds.bondsList[bonds.bondsList.length -1]);
            else if (which == 'r')
                rings.remove(rings.ringsList[rings.ringsList.length - 1]);
            else if (which == 'w')
                arrows.arrowsList.pop();
            else if (which == 't')
                boxes.textBoxesList.pop();
        }
        else if (type == 'd') {
        /*
            if (which == 'a')
                atoms.remove(atoms.atomsList[atoms.atomsList.length -1]);
            else if (which == 'b')
                bonds.remove(bonds.bondsList[bonds.bondsList.length -1]);
            else if (which == 'r')
                rings.remove(rings.ringsList[rings.ringsList.length - 1]);
            else if (which == 'w')
                arrows.arrowsList.pop();
            else if (which == 't')
                boxes.textBoxesList.pop();
             */
        }
        else if(type == 'm') {
            if (which == 'a') {
                //ma0|0,0
                var seperator = action.indexOf('|');

                var atom = atoms.getAtomById(action.substring(2, seperator));
                if ( atom != null) {
                    var comma = action.indexOf(',', seperator);

                    atom.update(new Point(parseInt(action.substring(seperator + 1, comma)), parseInt(action.substring(comma + 1))));
                }
            }
            else if (which == 'b') {
                //mb0|0,0,0,0
                var seperator = action.indexOf('|');

                var bond = bonds.getBondById(action.substring(2, seperator));
                if ( bond != null) {
                    var comma = action.indexOf(',', seperator);
                    var comma2 = action.indexOf(',', comma+1);
                    var comma3 = action.indexOf(',', comma2+1);

                    bond.atom1.update(new Point(parseInt(action.substring(seperator + 1, comma)), parseInt(action.substring(comma + 1, comma2 ))));
                    bond.atom2.update(new Point(parseInt(action.substring(comma2+1, comma3)), parseInt(action.substring(comma3 + 1 ))));
                }
            }
            else if (which == 'r') {
                //mr0|0,0
                var seperator = action.indexOf('|');

                var ring = rings.getRingById(action.substring(2, seperator));
                if ( ring != null) {
                    var comma = action.indexOf(',', seperator);

                    ring.move(new Point(parseInt(action.substring(seperator + 1, comma)), parseInt(action.substring(comma + 1))));
                }
            }
            else if (which == 'w') {
                //mw0|0,0
                var seperator = action.indexOf('|');

                var arrow = arrows.getArrowById(action.substring(2, seperator));
                if ( arrow != null) {
                    var comma = action.indexOf(',', seperator);


                }
            }
            else if (which == 't') {
                //mt0|0,0
                var seperator = action.indexOf('|');

                var textBox = boxes.getTextBoxById(action.substring(2, seperator));
                if ( textBox != null) {
                    var comma = action.indexOf(',', seperator);
                    textBox.point.x = parseInt(action.substring(seperator + 1, comma));
                    textBox.point.y = parseInt(action.substring(comma + 1));
                }
            }
        }
        else if (type = 'c') {
            while (ClearTool.undo.length > 0) {
                var temp = ClearTool.undo.pop();

                if (temp instanceof Arrow)
                    arrows.arrowsList.push(temp);
                else if (temp instanceof Bond)
                    bonds.bondsList.push(temp);
                else if (temp instanceof Atom)
                    atoms.atomsList.push(temp);
                else if (temp instanceof Ring)
                    rings.ringsList.push(temp);
                else if (temp instanceof TextBox)
                    boxes.textBoxesList.push(temp);
            }
        }
    /*
        if (action.charAt(0) == 'c')
        {
            if (action.charAt(1) == 'a')
            {
                var line = action.indexOf('|');

                var atom = atoms.getAtomById(action.substring(2, line));
                if ( atom != null)
                {
                    atom.charge = action.substring(line+1);
                }
            }
        }
         */
    }
    return false;
}
UndoTool.add = function() {
    if (undoStack.length >= 50) {
        undoStack.shift();
    }

    var temp = {
        atoms: new Elements(),
        bonds: new Elements(),
        arrows: new Elements(),
        rings: new Elements(),
        boxes: new Elements()
    };
    $(elements.atoms.list).each(function(index, item) {
        temp.atoms.list.push($.extend(true, {}, item));
    });
    $(elements.bonds.list).each(function(index, item) {
        temp.bonds.list.push($.extend(true, {}, item));
    });
    $(elements.arrows.list).each(function(index, item) {
        temp.arrows.list.push($.extend(true, {}, item));
    });


    undoStack.push(temp);
}
////////////////////////////////////////////////////////////////////////////////
function ZoomTool(scale) {
    this.scale = scale;
}
ZoomTool.prototype = new Tool();
ZoomTool.prototype.onDown = function(point) {
    zoom *= this.scale;

    if (zoom <= 0.444444 || zoom >= 5.06)
        zoom /= this.scale;
}
////////////////////////////////////////////////////////////////////////////////
function BondTool(type) {
    this.type = type;
}
BondTool.prototype.onDown = function(selected) {
    if(selected instanceof Point) {
        elements.bonds.temp = new Bond(new Atom(selected), null, this.type);
    }
    else if(selected instanceof Atom) {
        elements.bonds.temp = new Bond(selected, null, this.type);
    }
    else if (selected instanceof Bond) {
        //Switch directions
        if (selected.type == this.type) {
            selected.update(selected.atom2, selected.atom1);
        }

        if (typeof(this.type) == "number") {
            selected.number = this.type;
            selected.type = "normal";
        }
        else {
            selected.number = 1;
            selected.type = this.type
        }


    }
}
BondTool.prototype.onDrag = function(over) {
    if (over instanceof Point && elements.bonds.temp != null) {
        elements.bonds.temp.update(null, new Atom(over));
    }
    else if (over instanceof Atom && elements.bonds.temp != null) {
        elements.bonds.temp.update(null, over);
    }

}
BondTool.prototype.onUp = function() {
    UndoTool.add();

    var tempBond = elements.bonds.temp;
    if (tempBond != null) {
        if ($.inArray(tempBond.atom1, elements.atoms.list) == -1) {
            elements.atoms.add(tempBond.atom1);
        }
        if ($.inArray(tempBond.atom2, elements.atoms.list) == -1) {
            elements.atoms.add(tempBond.atom2);
        }

        tempBond.atom1.connections.push(tempBond.atom2);
        tempBond.atom2.connections.push(tempBond.atom1);

        //Add the tempBond to the list
        elements.bonds.add(tempBond);

    //Add to the undo buffer
    //UndoTool.list.push("ab" + tempBond.id);
    }
    elements.bonds.temp = null;
}
////////////////////////////////////////////////////////////////////////////////
function MoveTool() {
    this.selected = null;
    this.newlocation = null;
}
MoveTool.prototype.onDown = function(selected) {
    if (selected != null) {
        this.selected = [selected];

        if (selected instanceof Atom) {
            UndoTool.list.push("ma" + selected.id + '|' + selected.point.x + ',' + selected.point.y);
        }
        else if (selected instanceof Bond) {
            UndoTool.list.push("mb" + selected.id + '|' + selected.atom1.point.x + ',' + selected.atom1.point.y + ',' + selected.atom2.point.x + ',' + selected.atom2.point.y);
        }
        else if (selected instanceof TextBox) {
            UndoTool.list.push("mt" + selected.id + '|' + selected.point.x + ',' + selected.point.y);
        }
        else if (selected instanceof Arrow) {
            UndoTool.list.push("mw" + selected.id + '|' + selected.center.x + ',' + selected.center.y );
        }
        else if (selected instanceof Ring) {
            UndoTool.list.push("mr" + selected.id + '|' + selected.center.x + ',' + selected.center.y );
        }
    }
}
MoveTool.prototype.onDrag = function(over) {
    if (this.selected != null) {
        $.each(this.selected, function(index, item) {
            if (item instanceof Atom && over instanceof Point) {
                item.update(over);
            }
            else if (item instanceof Arrow && over instanceof Point) {
                item.update(null, null, over);
            }

            else if (item instanceof Bond && over instanceof Point) {
                var dx = item.atom2.point.x - item.center.x;
                var dy = item.atom2.point.y - item.center.y;

                item.atom1.update(new Point(over.x - dx, over.y - dy));
                item.atom2.update(new Point(over.x + dx, over.y + dy));
            }
            else if (item instanceof Arrow && over instanceof Point) {
                var arrow = arrows.getArrowByPoint(item);

                if (item == arrow.point1) {
                    arrow.update(over);
                    item = arrow.point1
                }
                else if (item == arrow.point2) {
                    arrow.update(null, over);
                    item = arrow.point2;
                }
            }
            else if (item instanceof TextBox && over instanceof Point) {
                item.update(over);
            }
        });
    }
}
MoveTool.prototype.onUp = function(e) {
    UndoTool.add();

    if (e instanceof Atom && this.selected[0] instanceof Atom) {
        var temp = this.selected[0];
        $.each(elements.bonds.list, function(index, item) {
            if (item.atom1 == temp) {
                item.atom1 = e;
            }
            else if (item.atom2 == temp) {
                item.atom2 = e;
            }
        });
        var n = elements.atoms.list.indexOf(this.selected[0]);
        elements.atoms.list.splice(n, 1);
    }

    this.selected = null;
}
////////////////////////////////////////////////////////////////////////////////
