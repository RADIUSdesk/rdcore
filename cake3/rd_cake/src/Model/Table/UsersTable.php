<?php

// src/Model/Table/UsersTable.php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\Utility\Text;
use Cake\Validation\Validator;

class UsersTable extends Table
{

    //Used to build the list of children an Access Provider may have up to the end nodes.
    private $ap_children    = array();

    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');        
        $this->belongsTo('Groups');
        $this->belongsTo('Languages');
        $this->belongsTo('Countries');
        $this->hasMany('UserSettings');       
    }
      
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('username', 'A usrname is required')
            ->add('username', [ 
                'usernameUnique' => [
                    'message' => 'The username you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
    
}
