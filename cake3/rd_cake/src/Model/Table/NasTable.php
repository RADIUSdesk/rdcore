<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class NasTable extends Table
{
    public function initialize(array $config)
    {
        $this->addBehavior('Timestamp');
        $this->belongsTo('Users');
        
        $this->hasMany('NaRealms',['dependent' => false]); //Do not delete Realms when deleting NAS 
        $this->hasMany('NaTags',['dependent' => false]); //Do not delete Tags wen deleting NAS
         
        $this->hasMany('NaNotes',['dependent' => true]);
        $this->hasMany('OpenvpnClients',['dependent' => true]);
        $this->hasMany('PptpClients',['dependent' => true]);
        $this->hasMany('Actions',['dependent' => true]);
        $this->hasMany('NaStates',   [
				'dependent' => true,
				'limit'     => 1,
				'order'			=> [
					'NaStates.created DESC'
				]
			]);
        $this->table('nas');
    }
    
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('nasname', 'A name is required')
            ->add('nasname', [ 
                'nameUnique' => [
                    'message' => 'The nasname you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ])
            ->notEmpty('shortname', 'A value is required')
            ->add('shortname', [ 
                'nameUnique' => [
                    'message' => 'The shortname you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
    //Get the note ID before we delete it
    public function beforeDelete($event,$entity,$options = []){
        if(null !== $entity->id){
            //$class_name     = $entity->name;  // Not needed in cake 3
			$q_r 			= $this->findById($entity->id)->first();
			
			//if($q_r[$class_name]['connection_type'] == 'openvpn'){ // Old cake2 way
            if($q_r->connection_type == 'openvpn'){ //Open VPN needs special treatment when deleting
                $entity->openvpn_id    = $q_r->id;
            }

            if($q_r->connection_type == 'pptp'){ //Open VPN needs special treatment when deleting
                $entity->pptp_id    = $q_r->id;
            }
        }
        return true;
    }

    public function afterDelete($event,$entity,$options = []){
        if(null !== $entity->openvpn_id){ //Clean up openvpn
			$vpn = TableRegistry::getTableLocator()->get('OpenvpnClients');
            $q_r = $vpn->find()->where(['OpenvpnClients.na_id' => $entity->openvpn_id])->first();
            if($q_r){ //DeleteAll does not trigger the before and after delete callbacks!
                 //$vpn->id = $q_r->id;
                 $vpn->delete($q_r->id);
            }
        }

        if(null !== $entity->pptp_id){ //Clean up pptp
            $pptp =TableRegistry::getTableLocator()->get('PptpClients');
            $q_r = $pptp->find()->where(['PptpClients.na_id' => $entity->pptp_id])->first();
            if($q_r){ //DeleteAll does not trigger the before and after delete callbacks!
                 //$pptp->id = $q_r['PptpClient']['id'];
                 $pptp->delete($q_r->id);
            }
        }
    }
}
       
