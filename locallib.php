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
 * Internal library of functions for chemillustrator
 *
 * All the chemillustrator specific functions, needed to implement the module
 * logic, should go here. Never include this file from your lib.php!
 */
defined('MOODLE_INTERNAL') || die();

/**
 * Deletes the user's saved file
 *
 * @param int $userid User's id who owns the file
 * @param string $filename Filename of file to delete
 * @return void
 */
function chemillustrator_delete_savefile($userid, $filename) {
    global $DB;

    $DB->delete_records_select('chemillustrator_saves', "userid = $userid AND filename = '$filename'");
}

/**
 * Gets a list of the user's saved files
 *
 * @param int $userid User's id who owns saved files
 * @return stdClass Saved files object
 */
function chemillustrator_get_savefiles($userid) {
    global $DB;

    $data = new stdClass();
    $data->aaData = array();

    $files = $DB->get_records('chemillustrator_saves', array('userid' => $userid));
    foreach ($files as $file) {
        $entry = array();
        $entry[] = $file->filename;
        $entry[] = date('m/d/y h:i:s A', $file->timemodified);
        $data->aaData[] = $entry;
    }
    return $data;
}

/**
 * Saves a user's file
 *
 * @param int $userid User's id who is saving
 * @param string $filename Filename to use when saving
 * @param string $data Contents of the file
 * @param boolean $overwrite Overwrite/Don't overwrite
 * @return void|string "Overwrite?" if prompt is required
 */
function chemillustrator_save_savefile($userid, $filename, $data, $overwrite = false) {
    global $DB;

    $file = $DB->get_record_select('chemillustrator_saves', "userid = $userid AND filename = '$filename'");
    if ($file !== false) {
        if ($overwrite) {
            $file->data = $data;
            $file->timemodified = time();

            $DB->update_record('chemillustrator_saves', $file);
        } else {
            return "Overwrite?";
        }
    } else {
        $file = new stdClass();
        $file->userid = $userid;
        $file->filename = $filename;
        $file->data = $data;
        $file->timemodified = time();

        $DB->insert_record('chemillustrator_saves', $file);
    }
}

/**
 * Gets the data from a saved file
 *
 * @param int $userid User's id who owns saved files
 * @param string $filename Filename of file to get data from
 * @return string|null Data of the saved file otherwise null
 */
function chemillustrator_get_savefile_data($userid, $filename) {
    global $DB;

    $file = $DB->get_record_select('chemillustrator_saves', "userid = $userid AND filename = '$filename'");
    if ($file !== false) {
        return $file->data;
    }
    return null;
}
