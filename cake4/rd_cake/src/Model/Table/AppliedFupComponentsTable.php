<?php
/**
 * Created by Dirk van der Walt
 * User: dirkvanderwalt
 * Date: 31/12/2022
 * Time: 18:32
 */

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class AppliedFupComponentsTable extends Table{

    public function initialize(array $config):void{
        $this->addBehavior('Timestamp');
        $this->belongsTo('ProfileFupComponents');
    }   
}
