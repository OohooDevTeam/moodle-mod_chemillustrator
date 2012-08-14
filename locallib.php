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
 * Internal library of functions for module chemillustrator
 *
 * All the chemillustrator specific functions, needed to implement the module
 * logic, should go here. Never include this file from your lib.php!
 *
 * @package    mod
 * @subpackage chemillustrator
 * @copyright  2012 Braedan Jongerius <jongeriu@ualberta.ca>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();

/**
 * Deletes the user's saved file
 *
 * @param int $userid User's id who owns the file
 * @param string $filename File to delete
 * @return void
 */
function chemillustrator_delete_savefile($userid, $filename) {
    global $DB;

    $DB->delete_records_select('chemillustrator_saves', "userid = $userid AND filename = '$filename'");
}

/**
 * Gets the user's saved files
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
 * @return void
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
            echo "Overwrite?";
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
 * @param string $filename File to get data from
 * @return string Data of the saved file
 */
function chemillustrator_get_savefile_data($userid, $filename) {
    global $DB;

    $file = $DB->get_record_select('chemillustrator_saves', "userid = $userid AND filename = '$filename'");
    if ($file !== false) {
        return $file->data;
    }
}
