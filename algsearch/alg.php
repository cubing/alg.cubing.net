<?php

$logfile=fopen("alg_log.csv","a");
fwrite($logfile,$_SERVER['REMOTE_ADDR'].",".time().",".date("Y-m-d-h:i:s").",".$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]."\n");
fclose($logfile);

?>