<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Prints a particular instance of chemillustrator
 *
 * @package    mod
 * @subpackage chemillustrator
 * @copyright  2012 Braedan Jongerius <jongeriu@ualberta.ca>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(__FILE__) . '/lib.php');

$id = optional_param('id', 0, PARAM_INT); // course_module ID, or
$n = optional_param('n', 0, PARAM_INT);  // chemillustrator instance ID - it should be named as the first character of the module

if ($id) {
    $cm = get_coursemodule_from_id('chemillustrator', $id, 0, false, MUST_EXIST);
    $course = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $chemillustrator = $DB->get_record('chemillustrator', array('id' => $cm->instance), '*', MUST_EXIST);
} elseif ($n) {
    $chemillustrator = $DB->get_record('chemillustrator', array('id' => $n), '*', MUST_EXIST);
    $course = $DB->get_record('course', array('id' => $chemillustrator->course), '*', MUST_EXIST);
    $cm = get_coursemodule_from_instance('chemillustrator', $chemillustrator->id, $course->id, false, MUST_EXIST);
} else {
    error('You must specify a course_module ID or an instance ID');
}

require_login($course, true, $cm);
$context = get_context_instance(CONTEXT_MODULE, $cm->id);

add_to_log($course->id, 'chemillustrator', 'view', "view.php?id={$cm->id}", $chemillustrator->name, $cm->id);

/// Print the page header
$PAGE->set_url('/mod/chemillustrator/view.php', array('id' => $cm->id));
$PAGE->set_title(format_string($chemillustrator->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);
$PAGE->set_button($OUTPUT->update_module_button($cm->id, 'chemillustrator'));

$PAGE->requires->css('/mod/chemillustrator/css/jquery-ui-1.8.21.custom.css');
$PAGE->requires->css('/mod/chemillustrator/css/jquery.dataTables_themeroller.css');
$PAGE->requires->css('/mod/chemillustrator/css/chem.css');

$PAGE->requires->js('/mod/chemillustrator/js/jquery-1.7.2.min.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/jquery-ui-1.8.21.custom.min.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/jquery.mousewheel.min.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/jquery.dataTables.min.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/main.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/Arrows.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/Atoms.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/Bonds.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/canvas2image.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/sylvester.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/MOLFile.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/Math.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/TextBox.js', true);
$PAGE->requires->js('/mod/chemillustrator/js/Tools.js', true);

// other things you may want to set - remove if not needed
//$PAGE->set_cacheable(false);
//$PAGE->set_focuscontrol('some-html-id');
//$PAGE->add_body_class('chemillustrator-'.$somevar);
// Output starts here
echo $OUTPUT->header();

if (has_capability('mod/chemillustrator:view', $context)) {
    if ($chemillustrator->intro) { // Conditions to show the intro can change to look for own settings or whatever
        echo $OUTPUT->box(format_module_intro('chemillustrator', $chemillustrator, $cm->id), 'generalbox mod_introbox', 'chemillustratorintro');
    }
    echo $OUTPUT->heading(get_string('modulename', 'chemillustrator') . ': ' . $chemillustrator->name);
    ?>
    <div style="text-align:center">
        <div id="toolbar">
            <input id="move_tool" type="radio" name="tools"/><label for="move_tool" tool="MoveTool()" title="<?php echo get_string('move_tool', 'chemillustrator'); ?>">
                <img src="icons/move.png"/></label>
            <input id="bond_tool" type="radio" name="tools"/><label for="bond_tool" class="sub_tool" menu="#sub_bonds"><img/></label>
            <span id="sub_bonds" class="sub_menu">
                <input id="single_bond_tool" type="radio" name="bonds"/><label for="single_bond_tool" tool="BondTool(1)" title="<?php echo get_string('single_bond_tool', 'chemillustrator'); ?>">
                    <img src="icons/singlebond.png"/></label>
                <input id="double_bond_tool" type="radio" name="bonds"/><label for="double_bond_tool" tool="BondTool(2)" title="<?php echo get_string('double_bond_tool', 'chemillustrator'); ?>">
                    <img src="icons/doublebond.png"/></label>
                <input id="triple_bond_tool" type="radio" name="bonds"/><label for="triple_bond_tool" tool="BondTool(3)" title="<?php echo get_string('triple_bond_tool', 'chemillustrator'); ?>">
                    <img src="icons/triplebond.png"/></label>
                <input id="stereoup_bond_tool" type="radio" name="bonds"/><label for="stereoup_bond_tool" tool="BondTool('up')" title="<?php echo get_string('stereoup_bond_tool', 'chemillustrator'); ?>">
                    <img src="icons/stereoup.png"/></label>
                <input id="stereodown_bond_tool" type="radio" name="bonds"/><label for="stereodown_bond_tool" tool="BondTool('down')" title="<?php echo get_string('stereodown_bond_tool', 'chemillustrator'); ?>">
                    <img src="icons/stereodown.png"/></label>
            </span>
            <input id="eraser_tool" type="radio" name="tools"/><label for="eraser_tool" tool="EraserTool()" title="<?php echo get_string('eraser_tool', 'chemillustrator'); ?>">
                <img src="icons/eraser.png"/></label>
            <input id="ring_tool" type="radio" name="tools"/><label for="ring_tool" class="sub_tool" menu="#sub_rings"><img/></label>
            <span id="sub_rings" class="sub_menu">
                <input id="benzene_tool" type="radio" name="rings"/><label for="benzene_tool" tool="RingTool('benzene')" title="<?php echo get_string('benzene_ring_tool', 'chemillustrator'); ?>">
                    <img src="icons/benzene.png"/></label>
                <input id="penta_tool" type="radio" name="rings"/><label for="penta_tool" tool="RingTool('penta')" title="<?php echo get_string('penta_ring_tool', 'chemillustrator'); ?>">
                    <img src="icons/pentagon.png"/></label>
                <input id="hexa_tool" type="radio" name="rings"/><label for="hexa_tool" tool="RingTool('hexa')" title="<?php echo get_string('hexa_ring_tool', 'chemillustrator'); ?>">
                    <img src="icons/hexagon.png"/></label>
            </span>
            <input id="element_tool" type="radio" name="tools"/><label for="element_tool" class="sub_tool" menu="#sub_elements"><img/></label>
            <span id="sub_elements" class="sub_menu">
                <input id="C_tool" type="radio" name="elements"/><label for="C_tool" tool="ChangeElementTool('C')" title="<?php echo get_string('C', 'chemillustrator'); ?>">
                    <img src="icons/C.png"/></label>
                <input id="O_tool" type="radio" name="elements"/><label for="O_tool" tool="ChangeElementTool('O')" title="<?php echo get_string('O', 'chemillustrator'); ?>">
                    <img src="icons/O.png"/></label>
                <input id="P_tool" type="radio" name="elements"/><label for="P_tool" tool="ChangeElementTool('P')" title="<?php echo get_string('P', 'chemillustrator'); ?>">
                    <img src="icons/P.png"/></label>
                <input id="H_tool" type="radio" name="elements"/><label for="H_tool" tool="ChangeElementTool('H')" title="<?php echo get_string('H', 'chemillustrator'); ?>">
                    <img src="icons/H.png"/></label>
                <input id="N_tool" type="radio" name="elements"/><label for="N_tool" tool="ChangeElementTool('N')" title="<?php echo get_string('N', 'chemillustrator'); ?>">
                    <img src="icons/N.png"/></label>
                <input id="K_tool" type="radio" name="elements"/><label for="K_tool" tool="ChangeElementTool('K')" title="<?php echo get_string('K', 'chemillustrator'); ?>">
                    <img src="icons/K.png"/></label>
                <input id="S_tool" type="radio" name="elements"/><label for="S_tool" tool="ChangeElementTool('S')" title="<?php echo get_string('S', 'chemillustrator'); ?>">
                    <img src="icons/S.png"/></label>
                <input id="periodic_tool" type="radio" name="elements"/><label for="periodic_tool" tool="ChangeElementTool(null, true)" title="<?php echo get_string('periodic_table_tool', 'chemillustrator'); ?>">
                    <img src="icons/table.png"/></label>
            </span>
            <input id="arrow_tool" type="radio" name="tools"/><label for="arrow_tool" tool="ArrowTool()" title="<?php echo get_string('arrow_tool', 'chemillustrator'); ?>">
                <img src="icons/arrow.png"/></label>
            <input id="plus_charge_tool" type="radio" name="tools"/><label for="plus_charge_tool" tool="ChargeTool(1)" title="<?php echo get_string('plus_tool', 'chemillustrator'); ?>">
                <img src="icons/plus.png"/></label>
            <input id="negative_charge_tool" type="radio" name="tools"/><label for="negative_charge_tool" tool="ChargeTool(-1)" title="<?php echo get_string('minus_tool', 'chemillustrator'); ?>">
                <img src="icons/minus.png"/></label>
            <a id="undo_tool" for="undo_tool" tool="UndoTool()" title="<?php echo get_string('undo_tool', 'chemillustrator'); ?>">
                <img src="icons/undo.png"/></a>
            <a id="print_tool" for="print_tool" tool="PrintTool()" title="<?php echo get_string('print_tool', 'chemillustrator'); ?>">
                <img src="icons/print.png"/></a>
            <input id="text_tool" type="radio" name="tools"/><label for="text_tool" tool="TextTool()" title="<?php echo get_string('text_tool', 'chemillustrator'); ?>">
                <img src="icons/text.png"/></label>
            <input id="zoomin_tool" type="radio" name="tools"/><label for="zoomin_tool" tool="ZoomTool(1.5)" title="<?php echo get_string('zoomin_tool', 'chemillustrator'); ?>">
                <img src="icons/zoomin.png"/></label>
            <input id="zoomout_tool" type="radio" name="tools"/><label for="zoomout_tool" tool="ZoomTool(1/1.5)" title="<?php echo get_string('zoomout_tool', 'chemillustrator'); ?>">
                <img src="icons/zoomout.png"/></label>
            <input id="pan_tool" type="radio" name="tools"/><label for="pan_tool" tool="PanTool()" title="<?php echo get_string('pan_tool', 'chemillustrator'); ?>">
                <img src="icons/pan.png"/></label>
            <input id="select_tool" type="radio" name="tools"/><label for="select_tool" tool="SelectTool()" title="<?php echo get_string('select_tool', 'chemillustrator'); ?>">
                <img src="icons/select.png"/></label>
            <a id="save_tool" for="save_tool" tool="SaveTool()" title="<?php echo get_string('save_tool', 'chemillustrator'); ?>">
                <img src="icons/save.png"/></a>
            <a id="open_tool" for="open_tool" tool="OpenTool()" title="<?php echo get_string('open_tool', 'chemillustrator'); ?>">
                <img src="icons/open.png"/></a>
            <a id="clear_tool" for="clear_tool" tool="ClearTool()" title="<?php echo get_string('clear_tool', 'chemillustrator'); ?>">
                <img src="icons/clear.png"/></a>
            <a id="reset_tool" for="reset_tool" tool="ResetTool()" title="<?php echo get_string('reset_view_tool', 'chemillustrator'); ?>">
                <img src="icons/refresh.png"/></a>
        </div>

        <canvas id="canvas"><?php echo get_string('nohtml5', 'chemillustrator'); ?></canvas>

        <div id="TextPrompt" style="display:none;">
            <input type="text" />
        </div>

        <div id="PeriodicTable" style="display:none;">
            <table>
                <tr>
                    <td class="element blue">H</td><td></td><td colspan="10" rowspan="3" style="padding-left:20px;vertical-align:top;">
                        Element: <span id="element_name">abc</span><br/>
                        Mass: <span id="element_mass">323</span><br/>
                        Atomic number: <span id="element_number">3</span><br/>
                        Orbital: <span id="element_orbital">32s</span></td>
                    <td></td><td></td><td></td><td></td><td></td><td class="element">He</td>
                </tr><tr>
                    <td class="element blue">Li</td><td class="element">Be</td>
                    <td class="element">B</td><td class="element">C</td><td class="element">N</td><td class="element">O</td><td class="element">F</td><td class="element">Ne</td>
                </tr><tr>
                    <td class="element">Na</td><td class="element">Mg
                    <td class="element">Al</td><td class="element">Si</td><td class="element">P</td><td class="element">S</td><td class="element">Cl</td><td class="element">Ar</td>
                </tr><tr>
                    <td class="element">K</td><td class="element">Ca</td><td class="element">Sc</td><td class="element">Ti</td><td class="element">V</td><td class="element">Cr</td>
                    <td class="element">Mn</td><td class="element">Fe</td><td class="element">Co</td><td class="element">Ni</td><td class="element">Cu</td><td class="element">Zn</td>
                    <td class="element">Ga</td><td class="element">Ge</td><td class="element">As</td><td class="element">Se</td><td class="element">Br</td><td class="element">Kr</td>
                </tr><tr>
                    <td class="element">Rb</td><td class="element">Sr</td><td class="element">Y</td><td class="element">Zr</td><td class="element">Nb</td><td class="element">Mo</td>
                    <td class="element">Tc</td><td class="element">Ru</td><td class="element">Rh</td><td class="element">Pd</td><td class="element">Ag</td><td class="element">Cd</td>
                    <td class="element">In</td><td class="element">Sn</td><td class="element">Sb</td><td class="element">Te</td><td class="element">I</td><td class="element">Xe</td>
                </tr>
            </table>
        </div>

        <script type="text/javascript">
            var chemillustratorid = <?php echo $chemillustrator->id; ?>;
            $(function() {
                $(window).resize(function() {
                    $("#toolbar .subOpen").hide();
                });

                $("#toolbar").buttonset();
                $("#toolbar .sub_menu label").click(function() {
                    var parent = $(this).parent().prev();
                    parent.attr('tool', $(this).attr('tool'));
                    parent.attr('title', $(this).attr('title'));
                    parent.find("img").attr('src', $(this).find("img").attr('src'));
                });

                $("#toolbar .sub_tool").each(function () {
                    $($(this).attr('menu')).children('label').first().click();
                }).dblclick(function(event) {
                    event.preventDefault();
                    event.stopPropagation();

                    $($(this).attr('menu')).css({
                        left: $(this).position().left,
                        top: $(this).position().top + 32
                    }).slideDown('fast');
                });

                $("#toolbar label, #toolbar a").click(function() {
                    $("#toolbar .sub_menu").hide();

                    if ($(this).attr('tool') != null) {
                        currentTool = eval('new ' + $(this).attr('tool'));
                        try {
                            currentTool.onSelected();
                        }
                        catch(e) {}

                    }
                    else {
                        currentTool = null;
                    }

                    redraw();
                });

                init();

                $("#" + currentTool).click();

                var elementInfo = {
                    'H': {name: '<?php echo get_string('H', 'chemillustrator'); ?>', mass: '1.00794', orbital: '1s1'},
                    'He': {name: '<?php echo get_string('He', 'chemillustrator'); ?>', mass: '4.002602', orbital: '1s2'},
                    'Li': {name: '<?php echo get_string('Li', 'chemillustrator'); ?>', mass: '6.941', orbital: '[He] 2s1'},
                    'Be': {name: '<?php echo get_string('Be', 'chemillustrator'); ?>', mass: '9.012182', orbital: '[He] 2s2'},
                    'B': {name: '<?php echo get_string('B', 'chemillustrator'); ?>', mass: '10.811', orbital: '[He] 2s2 2p1'},
                    'C': {name: '<?php echo get_string('C', 'chemillustrator'); ?>', mass: '12.0107', orbital: '[He] 2s2 2p2'},
                    'N': {name: '<?php echo get_string('N', 'chemillustrator'); ?>', mass: '14.0067', orbital: '[He] 2s2 2p3'},
                    'O': {name: '<?php echo get_string('O', 'chemillustrator'); ?>', mass: '15.9994', orbital: '[He] 2s2 2p4'},
                    'F': {name: '<?php echo get_string('F', 'chemillustrator'); ?>', mass: '18.9984032', orbital: '[He] 2s2 2p5'},
                    'Ne': {name: '<?php echo get_string('Ne', 'chemillustrator'); ?>', mass: '20.1797', orbital: '[He] 2s2 2p6'},
                    'Na': {name: '<?php echo get_string('Na', 'chemillustrator'); ?>', mass: '22.98976928', orbital: '[Ne] 3s1'},
                    'Mg': {name: '<?php echo get_string('Mg', 'chemillustrator'); ?>', mass: '24.3050', orbital: '[Ne] 3s2'},
                    'Al': {name: '<?php echo get_string('Al', 'chemillustrator'); ?>', mass: '26.9815386', orbital: '[Ne] 3s2 3p1'},
                    'Si': {name: '<?php echo get_string('Si', 'chemillustrator'); ?>', mass: '28.0855', orbital: '[Ne] 3s2 3p2'},
                    'P': {name: '<?php echo get_string('P', 'chemillustrator'); ?>', mass: '30.973762', orbital: '[Ne] 3s2 3p3'},
                    'S': {name: '<?php echo get_string('S', 'chemillustrator'); ?>', mass: '32.065', orbital: '[Ne] 3s2 3p4'},
                    'Cl': {name: '<?php echo get_string('Cl', 'chemillustrator'); ?>', mass: '35.453', orbital: '[Ne] 3s2 3p5'},
                    'Ar': {name: '<?php echo get_string('Ar', 'chemillustrator'); ?>', mass: '39.948', orbital: '[Ne] 3s2 3p6'},
                    'K': {name: '<?php echo get_string('K', 'chemillustrator'); ?>', mass: '39.0983', orbital: '[Ar] 4s1'},
                    'Ca': {name: '<?php echo get_string('Ca', 'chemillustrator'); ?>', mass: '40.078', orbital: '[Ar] 4s2'},
                    'Sc': {name: '<?php echo get_string('Sc', 'chemillustrator'); ?>', mass: '44.955912', orbital: '[Ar] 3d1 4s2'},
                    'Ti': {name: '<?php echo get_string('Ti', 'chemillustrator'); ?>', mass: '47.867', orbital: '[Ar] 3d2 4s2'},
                    'V': {name: '<?php echo get_string('V', 'chemillustrator'); ?>', mass: '50.9415', orbital: '[Ar] 3d3 4s2'},
                    'Cr': {name: '<?php echo get_string('Cr', 'chemillustrator'); ?>', mass: '51.9961', orbital: '[Ar] 3d5 4s1'},
                    'Mn': {name: '<?php echo get_string('Mn', 'chemillustrator'); ?>', mass: '54.938045', orbital: '[Ar] 4s2 3d5'},
                    'Fe': {name: '<?php echo get_string('Fe', 'chemillustrator'); ?>', mass: '55.845', orbital: '[Ar] 3d6 4s2'},
                    'Co': {name: '<?php echo get_string('Co', 'chemillustrator'); ?>', mass: '58.933195', orbital: '[Ar] 4s2 3d7'},
                    'Ni': {name: '<?php echo get_string('Ni', 'chemillustrator'); ?>', mass: '58.6934', orbital: '[Ar] 4s2 3d8 or [Ar] 4s1 3d9'},
                    'Cu': {name: '<?php echo get_string('Cu', 'chemillustrator'); ?>', mass: '63.546', orbital: '[Ar] 3d10 4s1'},
                    'Zn': {name: '<?php echo get_string('Zn', 'chemillustrator'); ?>', mass: '65.38', orbital: '[Ar] 3d10 4s2'},
                    'Ga': {name: '<?php echo get_string('Ga', 'chemillustrator'); ?>', mass: '69.723', orbital: '[Ar] 4s2 3d10 4p1'},
                    'Ge': {name: '<?php echo get_string('Ge', 'chemillustrator'); ?>', mass: '72.63', orbital: '[Ar] 3d10 4s2 4p2'},
                    'As': {name: '<?php echo get_string('As', 'chemillustrator'); ?>', mass: '74.92160', orbital: '[Ar] 4s2 3d10 4p3'},
                    'Se': {name: '<?php echo get_string('Se', 'chemillustrator'); ?>', mass: '78.96', orbital: '[Ar] 4s2 3d10 4p4'},
                    'Br': {name: '<?php echo get_string('Br', 'chemillustrator'); ?>', mass: '79.904', orbital: '[Ar] 4s2 3d10 4p5'},
                    'Kr': {name: '<?php echo get_string('Kr', 'chemillustrator'); ?>', mass: '83.798', orbital: '[Ar] 3d10 4s2 4p6'},
                    'Rb': {name: '<?php echo get_string('Rb', 'chemillustrator'); ?>', mass: '85.4678', orbital: '[Kr] 5s1'},
                    'Sr': {name: '<?php echo get_string('Sr', 'chemillustrator'); ?>', mass: '87.62', orbital: '[Kr] 5s2'},
                    'Y': {name: '<?php echo get_string('Y', 'chemillustrator'); ?>', mass: '88.90585', orbital: '[Kr] 4d1 5s2'},
                    'Zr': {name: '<?php echo get_string('Zr', 'chemillustrator'); ?>', mass: '91.224', orbital: '[Kr] 5s2 4d2'},
                    'Nb': {name: '<?php echo get_string('Nb', 'chemillustrator'); ?>', mass: '92.90638', orbital: '[Kr] 4d4 5s1'},
                    'Mo': {name: '<?php echo get_string('Mo', 'chemillustrator'); ?>', mass: '95.96', orbital: '[Kr] 5s1 4d5'},
                    'Tc': {name: '<?php echo get_string('Tc', 'chemillustrator'); ?>', mass: '98', orbital: '[Kr] 4d5 5s2'},
                    'Ru': {name: '<?php echo get_string('Ru', 'chemillustrator'); ?>', mass: '101.07', orbital: '[Kr] 4d7 5s1'},
                    'Rh': {name: '<?php echo get_string('Rh', 'chemillustrator'); ?>', mass: '102.90550', orbital: '[Kr] 5s1 4d8'},
                    'Pd': {name: '<?php echo get_string('Pd', 'chemillustrator'); ?>', mass: '106.42', orbital: '[Kr] 4d10'},
                    'Ag': {name: '<?php echo get_string('Ag', 'chemillustrator'); ?>', mass: '107.8682', orbital: '[Kr] 4d10 5s1'},
                    'Cd': {name: '<?php echo get_string('Cd', 'chemillustrator'); ?>', mass: '112.411', orbital: '[Kr] 5s2 4d10'},
                    'In': {name: '<?php echo get_string('In', 'chemillustrator'); ?>', mass: '114.818', orbital: '[Kr] 4d10 5s2 5p1'},
                    'Sn': {name: '<?php echo get_string('Sn', 'chemillustrator'); ?>', mass: '118.710', orbital: '[Kr] 4d10 5s2 5p2'},
                    'Sb': {name: '<?php echo get_string('Sb', 'chemillustrator'); ?>', mass: '121.760', orbital: '[Kr] 4d10 5s2 5p3'},
                    'Te': {name: '<?php echo get_string('Te', 'chemillustrator'); ?>', mass: '127.60', orbital: '[Kr] 4d10 5s2 5p4'},
                    'I': {name: '<?php echo get_string('I', 'chemillustrator'); ?>', mass: '126.90447', orbital: '[Kr] 4d10 5s2 5p5'},
                    'Xe': {name: '<?php echo get_string('Xe', 'chemillustrator'); ?>', mass: '131.293', orbital: '[Kr] 5s2 4d10 5p6'}
                };

                $("#PeriodicTable").dialog({
                    modal: true,
                    resizable: true,
                    autoOpen: false,
                    title: 'Save File',
                    width: 800
                });
                $("#PeriodicTable .element").click(function() {
                    currentTool.element = $(this).text();
                    $("#PeriodicTable").dialog('close');
                }).hover(function() {
                    var table = $("#PeriodicTable");
                    table.find("#element_name").text(elementInfo[$(this).text()].name);
                    table.find("#element_mass").text(elementInfo[$(this).text()].mass);
                    var element = $(this).text();
                    var n = 1;
                    $.each(elementInfo, function(index, item) {
                        if (index == element) {

                            return false;
                        }
                        n++;
                    });
                    table.find("#element_number").text(n);
                    table.find("#element_orbital").text(elementInfo[$(this).text()].orbital);
                });

                $("#TextPrompt").dialog({
                    modal: true,
                    resizable: true,
                    autoOpen: false,
                    title: 'Enter new text',
                    width: 800,
                    buttons : {
                        Ok: function() {
                            if (selected instanceof Arrow) {
                                selected.update(null, null, null, $(this).find("input").val());
                            }
                            else if (selected instanceof Atom) {
                                selected.element = $(this).find("input").val();
                            }
                            else if (selected instanceof TextBox) {
                                selected.update(null, $(this).find("input").val());
                            }
                            $(this).dialog("close");
                        }
                    }
                });
            });
        </script>
    </div>
    <?php
}
else {
    echo $OUTPUT->box('Sorry, you do not have permissions to view this.', 'generalbox mod_introbox', 'chemillustratorintro');
}
// Finish the page
echo $OUTPUT->footer();
