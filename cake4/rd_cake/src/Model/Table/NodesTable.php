<?php

namespace App\Model\Table;
use Cake\ORM\Table;
use Cake\Validation\Validator;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class NodesTable extends Table{

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp'); 
        $this->belongsTo('Meshes');
        $this->belongsTo('Schedules');
		//$this->hasOne('NodeLoads');
        $this->hasMany('NodeStations',  ['dependent' => true]);
        $this->hasMany('NodeActions',   [
				'dependent' => true,
				'limit'     => 1,
				//'order'			=> [
				//	'NodeActions.created DESC'
				//]
			]);
        $this->hasMany('NodeLoads',     ['dependent' => true]);
        $this->hasMany('NodeSystems',   ['dependent' => true]);
        $this->hasMany('NodeIbssConnections',  ['dependent' => true]);
        $this->hasMany('NodeNeighbors',[
                'dependent'     => true,
				'order'			=> [
					'NodeNeighbors.modified DESC'
				]
            ]);

         $this->hasMany('NodeUptmHistories',  [
				//'dependent' => true, //Had to remove the dependent since it failed due to conditions FIXME for further investigation
				'foreignKey'	=> 'node_id',
				'limit' 		=> '100',
				'order'			=> [
					'NodeUptmHistories.state_datetime ASC'
				],
				'conditions'	=> [
					"NodeUptmHistories.modified >" => FrozenTime::now()->subHour(24)
				]
			]);
         $this->hasMany('Notifications',  [
				//'dependent' => true, //Had to remove the dependent since it failed due to conditions FIXME for further investigation
				'foreignKey'	=> 'item_id',
				'order'			=> [
					'Notifications.notification_datetime ASC'
				],
				'conditions'	=> [
					"Notifications.item_table = 'nodes'"
				]
			]);
         $this->hasMany('ViewNotifications',  [
				'foreignKey'	=> 'object_id',
				'order'			=> [
					'ViewNotifications.notification_datetime ASC'
				],
				'conditions'	=> [
					"ViewNotifications.object_type = 'nodes'"
				]
			]);
		$this->hasMany('NodeMeshEntries',  ['dependent' => true]);
        $this->hasMany('NodeMeshExits',  ['dependent' => true]);
        $this->hasMany('NodeWifiSettings',  ['dependent' => true]);
        $this->hasMany('NodeMpSettings',  ['dependent' => true]);
        
        $this->hasMany('NodeScans', ['dependent' => true]);        
        $this->hasMany('NodeConnectionSettings', ['dependent' => true]);      
        $this->hasMany('NodeSqmStats', ['dependent' => true]);

    }
    
    public function validationDefault(Validator $validator):Validator{
        $validator = new Validator();
        $validator
            ->notEmpty('mac', 'A name is required')
            ->add('mac', [ 
                'nameUnique' => [
                    'message' => 'The MAC you provided is already taken. Please provide another one.',
                     'rule'    => ['validateUnique', ['scope' => 'mesh_id']],
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
    
    public function get_ip_for_node($this_mesh_id){
    
        Configure::load('MESHdesk'); 
        $ip             = Configure::read('mesh_node.start_ip');
        $not_available  = true;
        while($not_available){
            if($this->_check_if_available($ip,$this_mesh_id)){
                $not_available = false;
                break;
            }else{
                $ip = $this->_get_next_ip($ip);
            }
        }     
        return $ip;
	}

    private function _check_if_available($ip,$mesh_id){
        $count = $this->find()->where(['Nodes.ip' => $ip,'Nodes.mesh_id' => $mesh_id])->count();
        if($count == 0){
            return true;
        }else{
            return false;
        }
    }

    private function _get_next_ip($ip){

        $pieces     = explode('.',$ip);
        $octet_1    = $pieces[0];
        $octet_2    = $pieces[1];
        $octet_3    = $pieces[2];
        $octet_4    = $pieces[3];

        if($octet_4 >= 254){
            $octet_4 = 1;
            $octet_3 = $octet_3 +1;
        }else{

            $octet_4 = $octet_4 +1;
        }
        $next_ip = $octet_1.'.'.$octet_2.'.'.$octet_3.'.'.$octet_4;
        return $next_ip;
    }
      
}
