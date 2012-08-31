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
 * Save the picture as a png file
 */
header("Content-Type: image/png");
header("Content-Disposition: attachment; filename='$_POST[filename].png';");

echo base64_decode(str_replace("data:image/png;base64,", "", $_POST['data']));
?>
