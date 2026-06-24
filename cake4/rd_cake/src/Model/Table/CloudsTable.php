<?php
//-- CakePHPv5 ready --
declare(strict_types=1);

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;

class CloudsTable extends Table {
    public function initialize(array $config):void{
        parent::initialize($config);  
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        
       	$this->hasMany('TopUps',[
            'dependent' => true
        ]);
        $this->hasMany('Hardwares',[
            'dependent' => true
        ]);
        
        $this->hasMany('Sites',[
            'dependent' => true
        ]);
        
        $this->hasMany('Vouchers',[
            'dependent' => true
        ]);
        
        $this->hasMany('PermanentUsers',[
            'dependent' => true
        ]);
        
        $this->hasMany('DynamicDetails',[
            'dependent' => true
        ]);
        
        $this->hasMany('DynamicClients',[
            'dependent' => true
        ]);
        
        $this->hasMany('Profiles',[
            'dependent' => true
        ]);
        
        $this->hasMany('ProfileComponents',[
            'dependent' => true
        ]);
        
        $this->hasMany('PredefinedCommands',[
            'dependent' => true
        ]);
        
        $this->hasMany('Schedules',[
            'dependent' => true
        ]);
        
        $this->hasMany('CloudSettings',[
            'dependent' => true
        ]);
        
        $this->hasMany('EmailHistories',[
            'dependent' => true
        ]);
        
        $this->hasMany('SmsHistories',[
            'dependent' => true
        ]);
        
        $this->hasMany('FirewallApps',[
            'dependent' => true
        ]);
        
        $this->hasMany('CloudAdmins'); //Not dependent!!!
    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator
            ->notEmpty('name', 'A name is required')
            ->add('name', [ 
                'nameUnique' => [
                    'message'   => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique',
                    'provider'  => 'table'
                ]
            ]);
        return $validator;
    }   
}
