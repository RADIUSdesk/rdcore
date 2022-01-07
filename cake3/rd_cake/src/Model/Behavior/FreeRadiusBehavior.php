<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;
use Cake\Routing\Router;


class FreeRadiusBehavior extends Behavior {

    protected $Radchecks;
    
    protected $_defaultConfig = [
        'for_model' => 'Vouchers' //Can be Vouchers / PermanentUsers / Devices
    ];
    
    protected $puChecks = [
        'profile'           => 'User-Profile',
        'realm'             => 'Rd-Realm',
        'time_cap_type'     => 'Rd-Cap-Type-Time',
        'data_cap_type'     => 'Rd-Cap-Type-Data',
        'active'            => 'Rd-Account-Disabled',
        'from_date'         => 'Rd-Account-Activation-Time',
        'to_date'           => 'Expiration',
        'auto_add'          => 'Rd-Auto-Mac',
        'auth_type'         => 'Rd-Auth-Type',
        'ssid_only'         => 'Rd-Ssid-Check',
        'cleartext_password'=> 'Cleartext-Password'
    ];
    
    protected $puReplies = [
        'static_ip'         => 'Framed-IP-Address'
    ];

    protected $vChecks = [
        'profile'           => 'User-Profile',
        'realm'             => 'Rd-Realm', 
        'password'          => 'Cleartext-Password',
        'time_valid'        => 'Rd-Voucher',
        'expire'            => 'Expiration',
        'ssid_only'         => 'Rd-Ssid-Check'
    ];

    protected  $readOnlyAttributes = [
            'Rd-User-Type', 'Rd-Device-Owner', 'Rd-Account-Disabled', 'User-Profile', 'Expiration',
            'Rd-Account-Activation-Time', 'Rd-Not-Track-Acct', 'Rd-Not-Track-Auth', 'Rd-Auth-Type', 
            'Rd-Cap-Type-Data', 'Rd-Cap-Type-Time' ,'Rd-Realm', 'Cleartext-Password'
    ];

    protected $binaries = [
        'ssid_only',
        'auto_add',
    ];

    protected $reverse_binaries = [
        'active'
    ];

    protected $fr_dates = [
        'from_date',
        'to_date',
        'expire'
    ];

    protected $tables_to_delete_username= [
        'Radchecks',
        'Radreplies',
        'Radaccts',
        'Radpostauths',
        'UserStats',
        'UserSsids'
    ];


    public function initialize(array $config){
        // Some initialization code here
        $this->Radchecks    = TableRegistry::get('Radchecks');
        $this->Radreplies   = TableRegistry::get('Radreplies');
        $this->UserSsids    = TableRegistry::get('UserSsids');
    
    }

    //This checks if the $username has a Rd-Ssid-Check and if set to 1 wit return true 
    public function hasSsidCheck($username){
        
        $count = $this->Radchecks->find()->where([
            'username'  => $username,
            'attribute' => 'Rd-Ssid-Check',
            'value'     => '1'
        ])->count();

        if($count > 0){
            return true;
        }
        return false;
    }

    public function listRestrictedSsids($username){

        $q_us = $this->UserSsids->find()->where(['username' => $username])->all();
        $ssids = array();
        foreach($q_us as $i){
            array_push($ssids, array('name' => $i->ssidname));
        }

        $s = TableRegistry::get('Ssids');
        $q_r = $s->find()->where(['OR' =>$ssids])->all();
        $ssid_list = array();
        foreach($q_r as $j){
            array_push($ssid_list , array('id' => $j->id, 'name' => $j->name));
        }
        return $ssid_list;
    }

    public function setRestrictListOfDevices($username, $restrict = true){
        if($restrict == 'true'){
            $this->_replace_radcheck_item($username,'Rd-Mac-Check',1);
        }else{
           $this->_remove_radcheck_item($username,'Rd-Mac-Check'); 
        }
    }

    public function setAutoMac($username, $auto = true){
        if($auto == 'true'){
            $this->_replace_radcheck_item($username,'Rd-Auto-Mac',1);
        }else{
           $this->_remove_radcheck_item($username,'Rd-Auto-Mac'); 
        }
    }

    public function getCleartextPassword($username){
        $qr = $this->Radchecks->find()->where([
            'username'  => $username,
            'attribute' => 'Cleartext-Password'
        ])->first();
        return $qr ? $qr->value : '';
    }

    public function deviceMenuSettings($username){
        $settings = ['listed_only' => false,'add_mac' => false];

        $c_listed = $this->Radchecks->find()->where([
            'username'  => $username,
            'attribute' => 'Rd-Mac-Check',
            'value'     => '1'
        ])->count();
        if($c_listed > 0){
            $settings['listed_only'] = true;
        }

        $c_auto = $this->Radchecks->find()->where([
            'username'  => $username,
            'attribute' => 'Rd-Auto-Mac',
            'value'     => '1'
        ])->count();
        if($c_auto > 0){
            $settings['add_mac'] = true;
        }

        return $settings;
    }

    public function  privateAttrIndex($username){
        $items  = [];
        $q_r    =  $this->Radchecks->find()->where(['username' => $username])->all();
        foreach($q_r as $i){
            $edit_flag      = true;
            $delete_flag    = true;
            if(in_array($i->attribute,$this->readOnlyAttributes)){
                $edit_flag      = false;
                $delete_flag    = false;
            }     
            array_push($items,array(
                'id'        => 'chk_'.$i->id,
                'type'      => 'check', 
                'attribute' => $i->attribute,
                'op'        => $i->op,
                'value'     => $i->value,
                'edit'      => $edit_flag,
                'delete'    => $delete_flag
            ));
        }

        $q_r    =  $this->Radreplies->find()->where(['username' => $username])->all();
        foreach($q_r as $i){
            $edit_flag      = true;
            $delete_flag    = true;
            if(in_array($i->attribute,$this->readOnlyAttributes)){
                $edit_flag      = false;
                $delete_flag    = false;
            }     
            array_push($items,array(
                'id'        => 'rpl_'.$i->id,
                'type'      => 'reply', 
                'attribute' => $i->attribute,
                'op'        => $i->op,
                'value'     => $i->value,
                'edit'      => $edit_flag,
                'delete'    => $delete_flag
            ));
        }
        return $items;
    }

    public function privateAttrAdd($request){
    
        $this->request = $request;
        
        if(isset($this->request->query['username'])){
            $username                           = $this->request->query['username'];
            $this->request->data['username']    = $username;
            unset($this->request->data['id']); 
            if($this->request->data['type'] == 'check'){
			    $entity = $this->{'Radchecks'}->newEntity($this->request->data);
                $this->{'Radchecks'}->save($entity);
                return $entity;	
            }

            if($this->request->data['type'] == 'reply'){
                $entity = $this->{'Radreplies'}->newEntity($this->request->data);
                $this->{'Radchecks'}->save($entity);
                return $entity;
            }
        }
    }

    public function privateAttrEdit($request){

        $this->request = $request;
        if(isset($this->request->query['username'])){
            $username                           = $this->request->query['username'];
            $this->request->data['username']    = $username;
            
            //First time entries (Is numeric)
            if(is_numeric($this->request->data['id'])){ //check Type remained the same
                if($this->request->data['type'] == 'check'){
                    $entity  = $this->{'Radchecks'}->get($this->request->data['id']);
                    $this->{'Radchecks'}->patchEntity($entity, $this->request->data());
                    $this->{'Radchecks'}->save($entity);
                }else{
                    $e_delete   = $this->{'Radchecks'}->get($this->request->data['id']);
                    $this->{'Radchecks'}->delete($e_delete);
                    $entity = $this->{'Radreplies'}->newEntity($this->request->data());
                    $this->{'Radreplies'}->save($entity);
                    $id = 'rpl_'.$entity->id;
                    $this->request->data['id'] = $id;
                }
                return $entity;	
            }
               
            //Check if the type check was not changed
            if((preg_match("/^chk_/",$this->request->data['id']))&&($this->request->data['type']=='check')){ //check Type remained the same
                //Get the id for this one
                $type_id                        = explode( '_', $this->request->data['id']);
                $this->request->data['id']      = $type_id[1];
                $entity                         = $this->{'Radchecks'}->get($this->request->data['id']);
                $this->{'Radchecks'}->patchEntity($entity, $this->request->data());
                $this->{'Radchecks'}->save($entity);
                return $entity;	
            }

            //Check if the type reply was not changed
            if((preg_match("/^rpl_/",$this->request->data['id']))&&($this->request->data['type']=='reply')){ //reply Type remained the same
                //Get the id for this one
                $type_id                        = explode( '_', $this->request->data['id']);
                $this->request->data['id']      = $type_id[1];
                $entity                         = $this->{'Radreplies'}->get($this->request->data['id']);
                $this->{'Radreplies'}->patchEntity($entity, $this->request->data());
                $this->{'Radreplies'}->save($entity);
                return $entity;	
            }

            //____ Attribute Type changes ______
            if((preg_match("/^chk_/",$this->request->data['id']))&&($this->request->data['type']=='reply')){
                //Delete the check; add a reply
                $type_id    = explode( '_', $this->request->data['id']);
                $d_id       = $type_id[1];
                $e_delete   = $this->{'Radchecks'}->get($d_id);
                $this->{'Radchecks'}->delete($e_delete);
                $entity = $this->{'Radreplies'}->newEntity($this->request->data);
                $this->{'Radreplies'}->save($entity);
                $id = 'rpl_'.$entity->id;
                $this->request->data['id'] = $id;
                return $entity;	
            }

            if((preg_match("/^rpl_/",$this->request->data['id']))&&($this->request->data['type']=='check')){
                //Delete the reply; add a reply
                $type_id    = explode( '_', $this->request->data['id']);
                $d_id       = $type_id[1];
                $e_delete   = $this->{'Radreplies'}->get($d_id);
                $this->{'Radreplies'}->delete($e_delete);
                $entity = $this->{'Radchecks'}->newEntity($this->request->data);
                $this->{'Radchecks'}->save($entity);
                $id = 'chk_'.$entity->id;
                $this->request->data['id'] = $id;
                return $entity;
            }
        }
    }

    public function privateAttrDelete($request){
        $fail_flag = false;
        $this->request = $request;
        if(isset($this->request->data['id'])){   //Single item delete
            $type_id            = explode( '_', $this->request->data['id']);
            if(preg_match("/^chk_/",$this->request->data['id'])){    
                //Check if it should not be deleted
                $qr = $this->{'Radchecks'}->get($type_id[1]);
                if($qr){
                    $name = $qr->attribute;
                    if(in_array($name,$this->readOnlyAttributes)){
                        $fail_flag = true;
                    }else{
                        $this->{'Radchecks'}->delete($qr);
                    }            
                }
            }

            if(preg_match("/^rpl_/",$this->request->data['id'])){   
                $qr = $this->{'Radreplies'}->get($type_id[1]);
                if($qr){
                    $this->{'Radreplies'}->delete($qr);
                }
            }         
   
        }else{ 
            foreach($this->request->data as $d){
                $type_id            = explode( '_', $d['id']);
                if(preg_match("/^chk_/",$d['id'])){

                    $qr = $this->{'Radchecks'}->get($type_id[1]);
                    if($qr){
                        $name = $qr->attribute;
                        if(in_array($name,$this->readOnlyAttributes)){
                            $fail_flag = true;
                        }else{
                            $this->{'Radchecks'}->delete($qr);
                        }            
                    }

                }
                if(preg_match("/^rpl_/",$d['id'])){   
                    $qr = $this->{'Radreplies'}->get($type_id[1]);
                    if($qr){
                        $this->{'Radreplies'}->delete($qr);
                    }
                }           
            }
        }
        return $fail_flag;
    }

    public function beforeSave($event, $entity){
        $this->_doBeforeSave($entity);   
    }

    public function afterSave($event, $entity){
        $this->_doAfterSave($entity);   
    }

    public function afterDelete($event, $entity){
        $this->_doAfterDelete($entity);
    }

    private function _doBeforeSave($entity){
        $config = $this->config();
        if($config['for_model']== 'Vouchers'){
            $this->_forVouchersBeforeSave($entity);
        }
    }


    private function _doAfterDelete($entity){
        $config = $this->config();
        if($config['for_model']== 'PermanentUsers'){
            $this->_deleteUsernameEntriesFromTables($entity->username);
            
        }

        if($config['for_model']== 'Devices'){
            $this->_deleteUsernameEntriesFromTables($entity->name);
        }

        if($config['for_model']== 'Vouchers'){
            $this->_deleteUsernameEntriesFromTables($entity->name);
        }
    }

    private function _forVouchersBeforeSave($entity){

        $request = Router::getRequest();
        if(isset($request->data['days_valid'])){
            if($request->data['days_valid'] !== ''){
                $hours      = 0;
                $minutes    = 0;
                if(isset($request->data['hours_valid'])){
                    $hours = $request->data['hours_valid'];
                }

                if(isset($request->data['minutes_valid'])){
                    $minutes = $request->data['minutes_valid'];
                }

                $hours      = sprintf("%02d", $hours);
                $minutes    = sprintf("%02d", $minutes);
                $valid      = $request->data['days_valid']."-".$hours."-".$minutes."-00";
                $entity->time_valid = $valid;    
            }
        }else{
            $entity->time_valid = '';
        }
		//Auto-populate the time_cap field with the value for time_valid
		if($entity->time_valid !== ''){
			$expire		= $entity->time_valid;
			$pieces     = explode("-", $expire);
            $time_avail = ($pieces[0] * 86400)+($pieces[1] * 3600)+($pieces[2] * 60)+($pieces[3]);
			$entity->time_cap = $time_avail;
		}
    }

    private function _deleteUsernameEntriesFromTables($username){

        //NOTE This might slow down delete actions - Just a heads-up
        foreach($this->tables_to_delete_username as $t){
            $table = TableRegistry::get($t);
            $table->deleteAll(['username' => $username]);
        }
    }
    
    private function _doAfterSave($entity){
        $config = $this->config();
        if ($entity->isNew()){
            if($config['for_model']== 'PermanentUsers'){
                $this->_forPermanentUserAdd($entity);
            }

            if($config['for_model']== 'Devices'){
                $this->_forDeviceAdd($entity);
            }

            if($config['for_model']== 'Vouchers'){
                $this->_forVoucherAdd($entity);
            }
        }else{
            //We do the update bit
            if($config['for_model']== 'PermanentUsers'){
                 $this->_forPermanentUserEdit($entity);
            }
            if($config['for_model']== 'Devices'){
                 $this->_forDeviceEdit($entity);
            }
            if($config['for_model']== 'Vouchers'){
                 $this->_forVoucherEdit($entity);
            }
        }
    }

    //==========================================
    //_________EDIT_____________________________
    //==========================================

    private function _forVoucherEdit($entity){
        $username       = $entity->name;
        $ssid_only      = false;
        foreach(array_keys($this->vChecks) as $key){
            if($entity->dirty("$key")){
                $value = $entity->{$key};
                if($value !== null){
                    if(in_array($key,$this->binaries)){
                        $value = 1;
                        if($key == 'ssid_only'){
                            $ssid_only = true;
                        }  
                    }
                    if(in_array($key,$this->reverse_binaries)){
                        if($value == 0){
                            $value = 1;
                        }else{
                            $value = 0;
                        }
                    }

                    if(in_array($key,$this->fr_dates)){   
                        if($value != ''){
                            $value = $this->_radius_format_date($value);
                        }else{
                            $value = 'will_be_removed';
                        } 
                    }
                    $this->_replace_radcheck_item($username,$this->vChecks["$key"],$value);
                }    
            }  
        }
        //If there are a restriction on SSID level we need to add those SSID's;
        if($ssid_only == true){
            $request = Router::getRequest();
            $this->_replace_user_ssids($username,$request->data['ssid_list']);
        }

        //IF the binaries is false remove them (if they were perhaps active)
        if($ssid_only == false){
            $this->_remove_radcheck_item($username,$this->vChecks["ssid_only"]);
            $this->UserSsids->deleteAll(['username' => $username]);
        }

        $request = Router::getRequest();
        if(!(isset($request->data['days_valid']))){
            $this->_remove_radcheck_item($username,$this->vChecks["time_valid"]);
        }

        //If always_active is selected remove fr->dates
       
        if(isset($request->data['never_expire'])){
            $this->_remove_radcheck_item($username,$this->vChecks["expire"]);
        }
    }

    private function _forDeviceEdit($entity){
         $username       = $entity->name;
         foreach(array_keys($this->puChecks) as $key){
            if($entity->dirty("$key")){
                $value = $entity->{$key};
                if($value !== null){
                    if(in_array($key,$this->reverse_binaries)){
                        if($value == 0){
                            $value = 1;
                        }else{
                            $value = 0;
                        }
                    }
                    if(in_array($key,$this->fr_dates)){   
                        $value = $this->_radius_format_date($value); 
                    }
                    $this->_replace_radcheck_item($username,$this->puChecks["$key"],$value);
                }
            }  
        }

        //Check if the owner changed - This can be fairly
        if($entity->dirty('permanent_user_id')){
            $new_owner_id       = $entity->permanent_user_id;
            $permanent_users    = TableRegistry::get('PermanentUsers');
            $e_pu               = $permanent_users->get($new_owner_id,[
                'contain' => ['Realms']
            ]);
            $new_realm_id   = $e_pu->real_realm->id;
            $new_realm      = $e_pu->real_realm->name;
            $new_owner_name = $e_pu->username;
            if($new_realm_id !== $entity->realm_id){
                //Big thing - Its into another realm
                $this->_replace_radcheck_item($username,'Rd-Device-Owner',$new_owner_name);

            }else{
                //Small thing Realm stays the same owner change
                $this->_replace_radcheck_item($username,'Rd-Device-Owner',$new_owner_name);
            }
        }
       
        //If always_active is selected remove fr->dates
        $request = Router::getRequest();
        if(isset($request->data['always_active'])){
            foreach($this->fr_dates as $d){
                if(array_key_exists($d, $this->puChecks)){
                    $this->_remove_radcheck_item($username,$this->puChecks["$d"]);
                }
            }
        }
    }

    private function _forPermanentUserEdit($entity){

        $username       = $entity->username;
        $ssid_only      = false;
        $auto_add       = false;
        foreach(array_keys($this->puChecks) as $key){
            if($entity->dirty("$key")){
                $value = $entity->{$key};
                if($value !== null){
                    if(in_array($key,$this->binaries)){
                        $value = 1;
                        if($key == 'ssid_only'){
                            $ssid_only = true;
                        }  
                    }
                    if(in_array($key,$this->reverse_binaries)){
                        if($value == 0){
                            $value = 1;
                        }else{
                            $value = 0;
                        }
                    }
                     
                    if(in_array($key,$this->fr_dates)){   
                        $value = $this->_radius_format_date($value); 
                    }

                    $this->_replace_radcheck_item($username,$this->puChecks["$key"],$value);
                }
            }  
        }
        
        foreach(array_keys($this->puReplies) as $key){
            if($entity->dirty("$key")){
                $value = $entity->{$key};
                if($key =='static_ip'){
                    if($entity->{$key} !== ''){
                        $this->_replace_radreply_item($username,'Service-Type','Framed-User');
                        $this->_replace_radreply_item($username,$this->puReplies["$key"],$value);
                    }else{
                        //Remove it if it is empty
                        $this->_remove_radreply_item($username,'Service-Type');
                        $this->_remove_radreply_item($username,$this->puReplies["$key"]);
                    }
                }else{
                    $this->_replace_radreply_item($username,$this->puReplies["$key"],$value);
                }
            }
        }
        
        
        //If there are a restriction on SSID level we need to add those SSID's;
        if($ssid_only == true){
            $request = Router::getRequest();
            $this->_replace_user_ssids($username,$request->data['ssid_list']);
        }

        //IF the binaries is false remove them (if they were perhaps active)
        if($ssid_only == false){
            $this->_remove_radcheck_item($username,$this->puChecks["ssid_only"]);
            $this->UserSsids->deleteAll(['username' => $username]);
        }

        if($auto_add == false){
            $this->_remove_radcheck_item($username,$this->puChecks["auto_add"]);
        }

        //If always_active is selected remove fr->dates
        $request = Router::getRequest();
        if(isset($request->data['always_active'])){
            foreach($this->fr_dates as $d){
                if(array_key_exists($d, $this->puChecks)){
                    $this->_remove_radcheck_item($username,$this->puChecks["$d"]);
                }
            }
        }
    }

    //==========================================
    //_________ADD______________________________
    //==========================================

    private function _forVoucherAdd($entity){
        $username = $entity->name;
        $ssid_only = false;
        //Remove any references if there are perhaps any
        $this->{'Radchecks'}->deleteAll(['username' => $username]);
         $this->{'UserSsids'}->deleteAll(['username' => $username]);

        foreach(array_keys($this->vChecks) as $key){
            if(($entity->{$key} !== '')&&($entity->{$key} !== null)){
                $value = $entity->{$key};

                if(in_array($key,$this->binaries)){
                    $value = 1;
                    if($key == 'ssid_only'){
                        $ssid_only = true;
                    }  
                }

                if(in_array($key,$this->reverse_binaries)){
                    if($value == 0){
                        $value = 1;
                    }else{
                        $value = 0;
                    }
                }
                if($key == 'expire'){
                    $value = $this->_radius_format_date($value);
                }
                $this->_add_radcheck_item($username,$this->vChecks["$key"],$value);
            }
        }

        //If there are a restriction on SSID level we need to add those SSID's;
        if($ssid_only == true){
            $request = Router::getRequest();
            $this->_replace_user_ssids($username,$request->data['ssid_list']);
        }

        //This is probably not even needed any more
        $this->_add_radcheck_item($username,'Rd-User-Type','voucher');    
    }

    private function _forDeviceAdd($entity){
        $username = $entity->name;
        //Remove any references if there are perhaps any
        $this->{'Radchecks'}->deleteAll(['username' => $username]);

        foreach(array_keys($this->puChecks) as $key){
            if(($entity->{$key} !== '')&&($entity->{$key} !== null)){
                $value = $entity->{$key};

                if(in_array($key,$this->reverse_binaries)){
                    if($value == 0){
                        $value = 1;
                    }else{
                        $value = 0;
                    }
                }
                if(in_array($key,$this->fr_dates)){
                    $value = $this->_radius_format_date($value);
                }
                $this->_add_radcheck_item($username,$this->puChecks["$key"],$value);
            }
        }
        $request = Router::getRequest(); //FIXME It looks like the newer version of CakePHP does not include added values to $request (28July2019)
        $this->_add_radcheck_item($username,'Rd-Device-Owner',$entity->rd_device_owner);
        //This is probably not even needed any more
        $this->_add_radcheck_item($username,'Rd-User-Type','device');    
    }

    
    private function _forPermanentUserAdd($entity){
        $username = $entity->username;
        //Remove any references if there are perhaps any
        $this->{'Radchecks'}->deleteAll(['username' => $username]);
        $this->{'UserSsids'}->deleteAll(['username' => $username]);

        $ssid_only = false;
        foreach(array_keys($this->puChecks) as $key){
            //print("Looking at ".$entity->{$key}."\n");
            if(($entity->{$key} !== '')&&($entity->{$key} !== null)){
                $value = $entity->{$key};
                //We override the value of value under certain conditions
                if(in_array($key,$this->binaries)){
                    $value = 1;

                    if($key == 'ssid_only'){
                        $ssid_only = true;
                    }  
                }
                if(in_array($key,$this->reverse_binaries)){
                    if($value == 0){
                        $value = 1;
                    }else{
                        $value = 0;
                    }
                }
                if(in_array($key,$this->fr_dates)){
                    $value = $this->_radius_format_date($value);
                }
                $this->_add_radcheck_item($username,$this->puChecks["$key"],$value);
            } 
        }
        
        foreach(array_keys($this->puReplies) as $key){
           if(($entity->{$key} !== '')&&($entity->{$key} !== null)){
                $value = $entity->{$key};
                $this->_add_radreply_item($username,$this->puReplies["$key"],$value);
                if($key =='static_ip'){
                    $this->_add_radreply_item($username,'Service-Type','Framed-User');
                }
            }
        }
        //If there are a restriction on SSID level we need to add those SSID's;
        if($ssid_only == true){
            $request = Router::getRequest();
            $this->_replace_user_ssids($username,$request->data['ssid_list']);
        }
        //This is probably not even needed any more
        $this->_add_radcheck_item($username,'Rd-User-Type','user');
    }

    private function _replace_user_ssids($username,$ssid_list){
		//Clean up previous ones
		$this->UserSsids->deleteAll(['username' => $username]);
		//Get all the SSID names from the $ssid_list
		$s =  TableRegistry::get('Ssids');
		$id_list = array();
		foreach($ssid_list as $i){
			array_push($id_list, array('id' => strval($i)));
		}

		$q_r = $s->find()->where(['OR' =>$id_list])->all();
		foreach($q_r as $j){
			$name = $j->name;
			$data = [];
			$data['username'] = $username;
			$data['ssidname'] = $name;
			$entity = $this->{'UserSsids'}->newEntity($data);
            $this->{'UserSsids'}->save($entity);	
		}
	}

    private function _add_radcheck_item($username,$item,$value,$op = ":="){
        $data = [
            'username'  => $username,
            'op'        => $op,
            'attribute' => $item,
            'value'     => $value
        ];
        $entity = $this->{'Radchecks'}->newEntity($data);
        $this->{'Radchecks'}->save($entity);
    }
    
    private function _add_radreply_item($username,$item,$value,$op = ":="){
        $data = [
            'username'  => $username,
            'op'        => $op,
            'attribute' => $item,
            'value'     => $value
        ];
        $entity = $this->{'Radreplies'}->newEntity($data);
        $this->{'Radreplies'}->save($entity);
    }

    private function _replace_radcheck_item($username,$item,$value,$op = ":="){
        $this->{'Radchecks'}->deleteAll(['username' => $username,'attribute' => $item]);
        $data = [
            'username'  => $username,
            'op'        => $op,
            'attribute' => $item,
            'value'     => $value
        ];
        $entity = $this->{'Radchecks'}->newEntity($data);
        $this->{'Radchecks'}->save($entity);
    }
    
    private function _replace_radreply_item($username,$item,$value,$op = ":="){
        $this->{'Radreplies'}->deleteAll(['username' => $username,'attribute' => $item]);
        $data = [
            'username'  => $username,
            'op'        => $op,
            'attribute' => $item,
            'value'     => $value
        ];
        $entity = $this->{'Radreplies'}->newEntity($data);
        $this->{'Radreplies'}->save($entity);
    }

    private function _remove_radcheck_item($username,$item){
        $this->{'Radchecks'}->deleteAll(['username' => $username,'attribute' => $item]);
    }
    
    private function _remove_radreply_item($username,$item){
        $this->{'Radreplies'}->deleteAll(['username' => $username,'attribute' => $item]);
    }
    
    private function _radius_format_date($d,$is_string=false){

        if($is_string){
            $formatted = $d;
        }else{
            //Format will be month/date/year eg 03/06/2013 we need it to be 6 Mar 2013
            $formatted  = $d->format("m/d/Y"); //We added this since we fixed a bug that actually made this a datetime object
        }
        $arr_date   = explode('/',$formatted);
        $month      = intval($arr_date[0]);
        $m_arr      = array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
        $day        = intval($arr_date[1]);
        $year       = intval($arr_date[2]);
        return "$day ".$m_arr[($month-1)]." $year";
    }
}

?>
