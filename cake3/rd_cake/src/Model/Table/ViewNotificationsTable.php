<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class ViewNotificationsTable extends Table 
{
    public function initialize(array $config)
	{
	
        $this->belongsTo('Users');
		
    }  
}
