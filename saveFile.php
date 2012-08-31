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

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(__FILE__) . '/locallib.php');

if (!isset($_POST['overwrite'])) {
    $_POST['overwrite'] = false;
}

if (chemillustrator_save_savefile($USER->id, $_POST['filename'], $_POST['data'], $_POST['overwrite']) == "Overwrite?") {
    echo get_string('overwrite', 'chemillustrator');
}
?>
