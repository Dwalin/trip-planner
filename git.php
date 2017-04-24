<?php

die(shell_exec(
    "
cd /home/kryzhani/done.report/travel/ &&
unset GIT_DIR &&
git pull origin master &&
exec git update-server-info
"
));

?>