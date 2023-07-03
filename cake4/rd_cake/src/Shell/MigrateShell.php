<?php

//as www-data
//cd /var/www/html/cake4/rd_cake && bin/cake migrate

namespace App\Shell;

use Cake\Console\Shell;
use Cake\Console\ConsoleOptionParser;
use Cake\Datasource\ConnectionManager;
use Cake\Datasource\FactoryLocator;


class MigrateShell extends Shell {

	protected $root_id = 44;
	protected $ap_cloud = [];

    public function main(){
    
        $this->out('Starting Migration');          
        ConnectionManager::alias('cake3', 'default');
		$this->getTableLocator()->clear();		
		$l_realms 	= [];				
		$ec_realms	= \Cake\ORM\TableRegistry::getTableLocator()->get('Realms')->find()->all();	
		foreach($ec_realms as $realm){
			$this->out($realm->name);
			array_push($l_realms,$realm->toArray());
		}
		
		foreach($l_realms as $r){		
			$this->realmToCloud($r);
		}
		
		print_r($this->ap_cloud);
		$this->apId2CloudId('DynamicDetails');
		//Then all the dependency tables:
		$this->oneToOne('DataCollectors');
		$this->oneToOne('DynamicDetailCtcs');
		$this->oneToOne('DynamicDetailMobiles');
		$this->oneToOne('DynamicDetailPrelogins');
		$this->oneToOne('DynamicDetailSocialLogins');
		$this->oneToOne('DynamicDetailTransKeys');
		$this->oneToOne('DynamicPages');
		$this->oneToOne('DynamicPairs');
		$this->oneToOne('DynamicPhotos');
		
		
		$this->apId2CloudId('DynamicClients');
		
		$this->oneToOne('DynamicClientRealms');
		$this->oneToOne('DynamicClientStates');
		
			
				
		$this->oneToOne('UserStats');
		$this->oneToOne('UserStatsDailies');
		$this->oneToOne('Radaccts');
		//$this->oneToOne('Radchecks');
		$this->oneToOne('Radgroupreplies');
		$this->oneToOne('Radgroupchecks');
       	$this->oneToOne('Radippool');
       	$this->oneToOne('Radpostauths');
       	//$this->oneToOne('Radreplies');
       	$this->oneToOne('Radusergroups');
       

  	}
  	
  	
  	function apId2CloudId($table){
  		$this->out("Convert AP id to Cloud ID in $table");
  		
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
			$id  	= $item['id'];
			$where 	= "$table".".id";
			$e   = $t->find()->where([$where => $id])->first();
			if(!$e){
				$ap_id = $item['user_id'];
				unset($item['user_id']);
				unset($item['created']);
				unset($item['modified']);
				$item['cloud_id'] = $this->ap_cloud[$ap_id];										
				$e = $t->newEntity($item);
				$t->save($e);				
			}		
		}	
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
		$orig_user_id	= $r['user_id'];
		$r['user_id'] 	= $this->root_id;
		//unset($r['id']);
		unset($r['created']);
		unset($r['modified']);
		
		$t_cloud = \Cake\ORM\TableRegistry::getTableLocator()->get("Clouds");					
		$e_cloud = $t_cloud->find()->where(['Clouds.name' => $name])->first();
		
		if(!$e_cloud){							
			$e_cloud = $t_cloud->newEntity($r);
			$t_cloud->save($e_cloud);				
		}
	
		$r['cloud_id'] 	= $e_cloud->id;
		
		$this->ap_cloud[$orig_user_id] = $e_cloud->id;
		
		$t_realms = \Cake\ORM\TableRegistry::getTableLocator()->get("Realms");
		$e_realm  = $t_realms->find()->where(['Realms.name' => $name])->first();
		if(!$e_realm){						
			$e_realm = $t_realms->newEntity($r);
			$t_realms->save($e_realm);
		}
		
		$new_realm_id = $e_realm->id;
		
		/*After we created the new realm we can go back to get the:
			1.) PermanentUsers
			2.) Profiles
			3.) ProfileComponents
			4.) DynamicClients
		*/	
		
		//======================
		//======= OLD ==========
		//======================
		
		
		//--- Read the OLD Permanent Users---
		ConnectionManager::alias('cake3', 'default');
		$this->getTableLocator()->clear();
		$l_permanent_users 	= [];
		$l_profile_ids   	= [];
		$l_profiles 		= [];
		$l_profile_comps 	= [];
		$l_profile_components = [];	
		
						
		$t_permanent_users 	= \Cake\ORM\TableRegistry::getTableLocator()->get("PermanentUsers");
		$ec_permanent_users = $t_permanent_users->find()->where(['PermanentUsers.realm' => $name])->all();
		$t_radchecks 		= \Cake\ORM\TableRegistry::getTableLocator()->get("Radchecks");
		
		foreach($ec_permanent_users as $pu){
			$this->out($pu->username);			
			//We have to get the cleartext password for the user to replace the encrypted password
			$username 	= $pu->username;
			$e_pwd 		= $t_radchecks->find()->where(['Radchecks.username' => $username, 'Radchecks.attribute' => 'Cleartext-Password'])->first();
			if($e_pwd){
				$d_pu = $pu->toArray();
				$pwd  = $e_pwd->value;
				$d_pu['password'] = $pwd;		
				array_push($l_permanent_users,$d_pu);
				$l_profile_ids[$pu->profile_id] = $pu->profile;
			}			
		}
		
		
		
		//Make a list of all the Profile IDs used
		$profiles_used = array_keys($l_profile_ids);
		
		if($profiles_used){		
			$t_profiles 	= \Cake\ORM\TableRegistry::getTableLocator()->get("Profiles");
			$t_profile_components 	= \Cake\ORM\TableRegistry::getTableLocator()->get("ProfileComponents");
			$t_radusergroups= \Cake\ORM\TableRegistry::getTableLocator()->get("Radusergroups");
			$ec_profiles    = $t_profiles->find()->where(['id IN' => $profiles_used])->all();
			$comp_names		= [];
			foreach($ec_profiles as $p){
				//$this->out($p->name);
				array_push($l_profiles,$p->toArray());			
				$ec_ug = $t_radusergroups->find()->where(["Radusergroups.username" => $p->name])->all();
				foreach($ec_ug as $ug){
					array_push($comp_names,$ug->groupname);
				}		
			}
			
			$ec_comps = $t_profile_components->find()->where(['name IN' => $comp_names])->all();
			foreach($ec_comps as $c){
				$this->out($c->name);
				array_push($l_profile_components,$c->toArray());		
			}
			
		}
				
						
		//===========================================
		//=========== NEW ===========================
		//===========================================
		$new_profiles = [];
		
		//-- Migrate them to the new DB ---
		ConnectionManager::dropAlias('default');
		$this->getTableLocator()->clear();
		
		
		//-- Start with new profile
		foreach($l_profiles as $p){		
			//Check if there are not already a Profile with this name
			$name 	= $p['name'];
		//	unset($p['id']);
			unset($p['created']);
			unset($p['modified']);
			$p['cloud_id'] 	= $e_cloud->id;						
			$e_profile = \Cake\ORM\TableRegistry::getTableLocator()->get("Profiles")->find()->where(['Profiles.name' => $name])->first();
			if(!$e_profile){							
				$e_profile = \Cake\ORM\TableRegistry::getTableLocator()->get("Profiles")->newEntity($p);
				\Cake\ORM\TableRegistry::getTableLocator()->get("Profiles")->save($e_profile);				
			}
			$new_profiles[$e_profile->name] = $e_profile->id;						
		}
		
		//-- Now Profile Components --
		foreach($l_profile_components as $pc){
		//	unset($pc['id']);
			unset($pc['created']);
			unset($pc['modified']);
			$pc['cloud_id'] 	= $e_cloud->id;
			$e_pc = \Cake\ORM\TableRegistry::getTableLocator()->get("ProfileComponents")->find()->where(['ProfileComponents.name' => $name])->first();
			if(!$e_pc){							
				$e_pc = \Cake\ORM\TableRegistry::getTableLocator()->get("ProfileComponents")->newEntity($pc);
				\Cake\ORM\TableRegistry::getTableLocator()->get("ProfileComponents")->save($e_pc);				
			}		
		}	
		
		//-- Then Permanent Users --
		foreach($l_permanent_users as $pu){	
			$username 	= $pu['username'];
		//	unset($pu['id']);
			unset($pu['created']);
			unset($pu['modified']);
			//Set the profile_id; realm_id; cloud_id
			$pu['cloud_id'] 	= $e_cloud->id;	
					
			$profile_name 		= $pu['profile'];
			$profile_id			= $new_profiles[$profile_name];
			$pu['profile_id'] 	= $profile_id;					
			$pu['realm_id'] 	= $new_realm_id;
				
			$e_pu = \Cake\ORM\TableRegistry::getTableLocator()->get("PermanentUsers")->find()->where(['PermanentUsers.username' => $username])->first();
			if(!$e_pu){							
				$e_pu = \Cake\ORM\TableRegistry::getTableLocator()->get("PermanentUsers")->newEntity($pu);
				\Cake\ORM\TableRegistry::getTableLocator()->get("PermanentUsers")->save($e_pu);				
			}
			$new_p_users[$e_profile->name] = $e_profile->id;							
		}										 	  	
  	}  	  	
}

?>
