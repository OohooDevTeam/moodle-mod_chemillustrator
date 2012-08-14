<?php

header("Content-Type: image/png");
header("Content-Disposition: attachment; filename='$_POST[filename].png';");

echo base64_decode(str_replace("data:image/png;base64,", "", $_POST['data']));
?>
