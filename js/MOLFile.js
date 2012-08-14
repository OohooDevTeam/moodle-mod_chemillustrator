//-----File format-----//
//NAME
//Arrows:p,p,p,p:p,p,p,p
//Text
//counts line:aaabbblllfffcccsssxxxrrrpppiiimmmvvvvvv
//atom block:xxxxx.xxxxyyyyy.yyyyzzzzz.zzzz aaaddcccssshhhbbbvvvHHHrrriiimmmnnneee
//bond block:111222tttsssxxxrrrccc
//charge property:M  CHG  1   2   1
function MOLFile() {}
MOLFile.read = function(fileContents) {
    //Read the file contents and split it at every newline
    var lines = fileContents.split('\n');

    var arrowData = lines[1].substring().split(':');
    for(var a = 0; a < arrowData.length; a++) {
        var points = arrowData[a].split(",");
        var arr = new Arrow(new Point(parseInt(points[0]), parseInt(points[1])), new Point(parseInt(points[2]), parseInt(points[3]))  );

        elements.arrows.list.push(arr);
    }

    var numatoms = parseInt(lines[3].substring(0, 3));
    var numbonds = parseInt(lines[3].substring(3, 6));

    var atomsImport = new Array();
    var bondsImport = new Array();

    for (var i = 0; i < numatoms; i++) {
        var point = new Point(parseInt(lines[4+i].substring(0, 10)*30), parseInt(lines[4+i].substring(10, 20)*30));
        var tempAtom = new Atom(point);
        tempAtom.element = lines[4+i].substring(31, 34).replace(/ /g, '');
        tempAtom.charge = parseInt(lines[4+i].substring(36, 39).replace(/ /g, ''));

        atomsImport.push(tempAtom);
    }

    for (var i = 0; i < numbonds; i++) {
        var atom1 = atomsImport[parseInt(lines[4+numatoms+i].substring(0, 3) -1)];
        var atom2 = atomsImport[parseInt(lines[4+numatoms+i].substring(3, 6) -1)];

        var number = parseInt(lines[4+numatoms+i].substring(6, 9));
        var type = parseInt(lines[4+numatoms+i].substring(9, 12));
        if (type == 0)
            type = "normal";
        else if (type == 1) {
            type = "stereodown";
        }
        else if (type == 6) {
            type = "stereoup";
        }

        var bond = new Bond(atom1, atom2, type, number);
        bondsImport.push(bond);
    }
    atoms.atomsList = atoms.atomsList.concat(atomsImport);
    bonds.bondsList = bonds.bondsList.concat(bondsImport);
}
MOLFile.save = function(name) {
    //Name block
    var data = name + '\n';

    //Comments block: arrows
    $.each(elements.arrows.list, function(index, item) {
        data += item.point1.x + ',' + item.point1.y + ',' + item.point2.x + ',' + item.point2.y +  ':';
    });
    if (elements.arrows.list.length > 0) {
        data = data.substring(0, data.length - 1);
    }
    data += '\n';

    //Comments block: text
    $.each(elements.boxes.list, function(index, item) {
        data += item.point.x + ',' + item.point.y + ',' + item.text + ':';
    });
    if (elements.boxes.list.length > 0) {
        data = data.substring(0, data.length - 1);
    }
    data += '\n';

    //Counts block
    data += elements.atoms.list.length.frontBuffer(3) + elements.bonds.list.length.frontBuffer(3) + "  0  0  0  0  0  0  0  0999 V2000\n";

    //Atom block
    $.each(elements.atoms.list, function(index, item) {
       data += (item.point.x/30).decimalBuffer(5,4) + (item.point.y/30).decimalBuffer(5,4) + parseInt(0).decimalBuffer(5,4) + ' ' + item.element.frontBuffer(3) + " 0" + item.charge.frontBuffer(3) + "  0  0  0  0  0  0  0  0  0  0" + '\n';
    });

    //Bond block
    $.each(elements.bonds.list, function(index, item) {
        if (item.atom1 != null && item.atom2 != null) {
            var a1 = 0;
            var a2 = 0;

            $.each(elements.atoms.list, function(index2, item2) {
                if (item.atom1 == item2) {
                    a1 = index2 + 1;
                }
                if (item.atom2 == item2) {
                    a2 = index2 + 1;
                }
            });

            data += a1.frontBuffer(3) + a2.frontBuffer(3) + item.number.frontBuffer(3) + parseInt(0).frontBuffer(3) + "  0  0  0" + '\n';
        }
    });

    data += "M  END"

    return data;
}

Number.prototype.frontBuffer = function(length) {
    return this.toString().frontBuffer(length);
}
Number.prototype.decimalBuffer = function(before, after) {
    var temp = this.toFixed(after);

    if (temp.length > before + after + 1)
        return null;
    else
        return temp.frontBuffer(before + after +1);
}
String.prototype.frontBuffer = function(length) {
    if (this.length >= length)
        return this;
    else
    {
        var temp = this;

        while (temp.length != length)
            temp = " " + temp;

        return temp;
    }
}
