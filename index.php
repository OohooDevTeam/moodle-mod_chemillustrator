<?php

/* * **********************************************************************
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
 * ********************************************************************** */

/**
 * Displays course instances of chemillustrator
 */
require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(__FILE__) . '/lib.php');

$id = required_param('id', PARAM_INT);   // course

$course = $DB->get_record('course', array('id' => $id), '*', MUST_EXIST);

require_course_login($course);

add_to_log($course->id, 'chemillustrator', 'view all', 'index.php?id=' . $course->id, '');

$coursecontext = get_context_instance(CONTEXT_COURSE, $course->id);

$PAGE->set_url('/mod/chemillustrator/index.php', array('id' => $id));
$PAGE->set_title(format_string($course->fullname));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($coursecontext);

echo $OUTPUT->header();

if (!$chemillustrators = get_all_instances_in_course('chemillustrator', $course)) {
    notice(get_string('nochemillustrators', 'chemillustrator'), new moodle_url('/course/view.php', array('id' => $course->id)));
}

$table = new html_table();
if ($course->format == 'weeks') {
    $table->head = array(get_string('week'), get_string('name'));
    $table->align = array('center', 'left');
} else if ($course->format == 'topics') {
    $table->head = array(get_string('topic'), get_string('name'));
    $table->align = array('center', 'left', 'left', 'left');
} else {
    $table->head = array(get_string('name'));
    $table->align = array('left', 'left', 'left');
}

foreach ($chemillustrators as $chemillustrator) {
    if (!$chemillustrator->visible) {
        $link = html_writer::link(
                        new moodle_url('/mod/chemillustrator/view.php', array('id' => $chemillustrator->coursemodule)), format_string($chemillustrator->name, true), array('class' => 'dimmed'));
    } else {
        $link = html_writer::link(
                        new moodle_url('/mod/chemillustrator/view.php', array('id' => $chemillustrator->coursemodule)), format_string($chemillustrator->name, true));
    }

    if ($course->format == 'weeks' or $course->format == 'topics') {
        $table->data[] = array($chemillustrator->section, $link);
    } else {
        $table->data[] = array($link);
    }
}

echo $OUTPUT->heading(get_string('modulenameplural', 'chemillustrator'), 2);
echo html_writer::table($table);
echo $OUTPUT->footer();
