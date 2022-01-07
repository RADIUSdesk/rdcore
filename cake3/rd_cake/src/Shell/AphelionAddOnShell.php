<?php
namespace App\Shell;

use Cake\Console\Shell;

class AphelionAddOnShell extends Shell{

    public $tasks = ['Aphelion'];

    public function initialize(){
        parent::initialize();   
    }

    public function main(){
        $this->Aphelion->main();
    }
}
