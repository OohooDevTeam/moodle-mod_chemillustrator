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
 * Defines the version of chemillustrator
 *
 * This code fragment is called by moodle_needs_upgrading() and
 * /admin/index.php
 */
defined('MOODLE_INTERNAL') || die();

$module->version = 2012082700;      // The current module version (Date: YYYYMMDDXX)
$module->requires = 2011070100;      // Requires this Moodle version
$module->component = 'mod_chemillustrator'; // To check on upgrade, that module sits in correct place
$module->maturity = MATURITY_ALPHA;
$module->release = '0.5.0 (Build: 2012082700)';
