<?php

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(__FILE__) . '/locallib.php');

chemillustrator_save_savefile($USER->id, $_POST['filename'], $_POST['data'], $_POST['overwrite']);
?>
