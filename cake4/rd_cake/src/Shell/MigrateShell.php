<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake migrate

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;
use Cake\Datasource\ConnectionManager;
use Cake\Datasource\FactoryLocator;


class MigrateShell extends Shell {

    public function main(){
    
        $this->out('Starting Migration');       
        //======== OLD ======      
        ConnectionManager::alias('cake3', 'default');
		$this->getTableLocator()->clear();
		
		$l_realms 			= [];
		$l_permanent_users 	= [];
		$l_profiles			= [];
				
		//=== Get all the realms ====		
		$ec_realms 		= \Cake\ORM\TableRegistry::getTableLocator()->get('Realms')->find()->all();	
		foreach($ec_realms as $realm){
			$this->out($realm->name);
			array_push($l_realms,$realm->toArray());
		}
		
		/*
		
		//=== Get all the permanent users
		$ec_permanent_users = \Cake\ORM\TableRegistry::getTableLocator()->get('PermanentUsers')->find()->all();
		foreach($ec_permanent_users as $pu){
			//$this->out($pu->username);
			array_push($l_permanent_users,$pu->toArray());
		}
		
		//=== Get all the profiles
		$ec_profiles = \Cake\ORM\TableRegistry::getTableLocator()->get('Profiles')->find()->all();
		foreach($ec_profiles as $p){
			//$this->out($p->name);
			array_push($l_profiles,$p->toArray());
		}
		
		*/
						
		
		//==== NEW =====



		
/*					
		foreach($l_realms as $r){		
			//Check if there are not already a Cloud with this name
			$name 			= $r['name'];
			$r['user_id'] 	= $this->root_id;
			unset($r['id']);
			unset($r['created']);
			unset($r['modified']);
						
			$e_cloud = $this->Clouds->find()->where(['Clouds.name' => $name])->first();
			if(!$e_cloud){							
				$e_cloud = $this->Clouds->newEntity($r);
				$this->Clouds->save($e_cloud);				
			}
			$this->cloud_id = $e_cloud->id;		
			$r['cloud_id'] 	= $this->cloud_id;
				
			$e_realm 		= $this->Realms->find()->where(['Realms.name' => $name])->first();
			if(!$e_realm){						
				$e_realm = $this->Realms->newEntity($r);
				$this->Realms->save($e_realm);
			}
			$new_realms[$e_realm->name] = $e_realm->id;						
		}
		
		foreach($l_profiles as $p){		
			//Check if there are not already a Profile with this name
			$name 			= $p['name'];
			unset($p['id']);
			unset($p['created']);
			unset($p['modified']);
			$p['cloud_id'] 	= $this->cloud_id;						
			$e_profile = $this->Profiles->find()->where(['Profiles.name' => $name])->first();
			if(!$e_profile){							
				$e_profile = $this->Profiles->newEntity($p);
				$this->Profiles->save($e_profile);				
			}
			$new_profiles[$e_profile->name] = $e_profile->id;						
		}
		
		foreach($l_permanent_users as $pu){
		
			$username 	= $pu['username'];
			unset($pu['id']);
			unset($pu['created']);
			unset($pu['modified']);
			//Set the profile_id; realm_id; cloud_id
			$pu['cloud_id'] 	= $this->cloud_id;
			
			$profile_name 		= $pu['profile'];
			$profile_id			= $new_profiles[$profile_name];
			$pu['profile_id'] 	= $profile_id;
			
			$realm_name 		= $pu['realm'];
			$realm_id			= $new_realms[$realm_name];
			$pu['realm_id'] 	= $realm_id;
				
			$e_pu = $this->PermanentUsers->find()->where(['PermanentUsers.username' => $username])->first();
			if(!$e_pu){							
				$e_pu = $this->PermanentUsers->newEntity($pu);
				$this->PermanentUsers->save($e_pu);				
			}
			$new_p_users[$e_profile->name] = $e_profile->id;							
		}
		
*/		
		foreach($l_realms as $r){		
			$this->realmToCloud($r);
		}
		
/*			
		$this->oneToOne('UserStats');
		$this->oneToOne('UserStatsDailies');
		$this->oneToOne('Radaccts');
		$this->oneToOne('Radchecks');
		$this->oneToOne('Radgroupreplies');
       	$this->oneToOne('Radippool');
       	$this->oneToOne('Radpostauths');
       	$this->oneToOne('Radreplies');
       	$this->oneToOne('Radusergroups');
*/

  	}
  	
  	function oneToOne($table){
  	
  		$this->out("One To One Copy for $table");
  		$l_orig = [];
  		
  		ConnectionManager::alias('cake3', 'default');
		$this->getTableLocator()->clear();			
		$ec = \Cake\ORM\TableRegistry::getTableLocator()->get("$table")->find()->all();	
		foreach($ec as $e){
			array_push($l_orig,$e->toArray());
		}
		
		ConnectionManager::dropAlias('default');
		$this->getTableLocator()->clear();
		
		$t = \Cake\ORM\TableRegistry::getTableLocator()->get("$table");
		
		foreach($l_orig as $item){		
			if($table == 'Radaccts'){
				$id  	= $item['radacctid'];
				$where	= "$table".".radacctid";				
			}else{
				$id  	= $item['id'];
				$where 	= "$table".".id";			
			}
			$e   = $t->find()->where([$where => $id])->first();
			if(!$e){							
				$e = $t->newEntity($item);
				$t->save($e);				
			}		
		}  	
  	}
  	
  	function realmToCloud($r){
  		$this->out("Realm To Cloud For ".$r['name']);
	
		//==ON THE NEW DB==
  		ConnectionManager::dropAlias('default');
		$this->getTableLocator()->clear();
		
		$name 			= $r['name'];
		$r['user_id'] 	= $this->root_id;
		unset($r['id']);
		unset($r['created']);
		unset($r['modified']);
		
		$t_cloud = \Cake\ORM\TableRegistry::getTableLocator()->get("Clouds");					
		$e_cloud = $t_cloud->find()->where(['Clouds.name' => $name])->first();
		
		if(!$e_cloud){							
			$e_cloud = $t_cloud->newEntity($r);
			$t_cloud->save($e_cloud);				
		}
		$this->cloud_id = $e_cloud->id;		
		$r['cloud_id'] 	= $this->cloud_id;
		
		/*
		
		
		$ec_permanent_users = \Cake\ORM\TableRegistry::getTableLocator()->get('PermanentUsers')->find()->all();
		foreach($ec_permanent_users as $pu){
			//$this->out($pu->username);
			array_push($l_permanent_users,$pu->toArray());
		}
		
		*/
		 	  	
  	}
  	
  	
}

?>
