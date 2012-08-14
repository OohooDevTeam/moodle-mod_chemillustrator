<?php

require_once(dirname(dirname(dirname(__FILE__))) . '/config.php');
require_once(dirname(__FILE__) . '/locallib.php');

echo json_encode(chemillustrator_get_savefile_data($USER->id, $_POST['filename']));
?>
