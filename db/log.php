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
 * Definition of log events
 */
defined('MOODLE_INTERNAL') || die();

global $DB;

$logs = array(
    array('module' => 'chemillustrator', 'action' => 'add', 'mtable' => 'chemillustrator', 'field' => 'name'),
    array('module' => 'chemillustrator', 'action' => 'update', 'mtable' => 'chemillustrator', 'field' => 'name'),
    array('module' => 'chemillustrator', 'action' => 'view', 'mtable' => 'chemillustrator', 'field' => 'name'),
    array('module' => 'chemillustrator', 'action' => 'view all', 'mtable' => 'chemillustrator', 'field' => 'name')
);
