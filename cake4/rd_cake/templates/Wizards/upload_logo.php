<?php
    use Cake\Core\Configure;
    Configure::write('debug', 0);
    echo json_encode($json_return);
    //echo json_encode(['koos'=>'oog']);
?>
