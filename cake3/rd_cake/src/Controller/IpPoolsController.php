<?php

namespace App\Controller;
use Cake\Core\Configure;

class IpPoolsController extends AppController {

    public $base = "Access Providers/Controllers/IpPools/";
    protected $main_model = 'IpPools';

    public function initialize(){
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadModel('PermanentUsers');
        $this->loadModel('Devices');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => $this->main_model,
            'sort_by' => $this->main_model . '.id'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');

        $this->loadComponent('JsonErrors');
        $this->loadComponent('TimeCalculations');
    }


//------------------------------------------------------------------------


    //____ BASIC CRUD Manager ________
    public function index(){

        $cquery = $this->request->getQuery();

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

        $query  = $this->{$this->main_model}->find();

        $this->CommonQuery->build_common_query($query, $user, ['Users']); //AP QUERY is sort of different in a way

        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(null !== $cquery['limit']){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();

        $items  = [];

        foreach ($q_r as $i) {
            array_push($items, $i);
        }
       
        //___ FINAL PART ___
        $this->set([
            'items' => $items,
            'success' => true,
            'totalCount' => $total,
            '_serialize' => ['items','success','totalCount']
        ]);
    }

	public function listOfPools(){

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

		$items 	= [];

        $q_r  = $this->{$this->main_model}->find()->distinct(['IpPools.pool_name'])->all();

		foreach($q_r as $i){
			array_push($items,[
			    'name' => $i->pool_name,
                'id' => $i->pool_name,
            ]);
		}

		$this->set([
            'items' 		=> $items,
            'success' 		=> true,
            '_serialize' => ['items','success']
        ]);
	}
 
    public function addPool() {

        $cdata = $this->request->getData();

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

		$count  = 0;
		$junk_trigger = 300; //We limit the trigger to 300 to prevent the user from creating havoc

		$ipPoolEntity = $this->{$this->main_model}->newEntity();

		//Start with the first IP
		$name 		= $cdata['name'];
		$current_ip	= $cdata['pool_start'];
		$end_ip		= $cdata['pool_end'];
		$next_ip	= $this->_get_next_ip($current_ip);

		while($current_ip != $end_ip){
			$count++;
			if($count > $junk_trigger){
				$this->set([
		            'success'   => false,
		            'message'   => ['message' => "Could not add pool - Recheck range"],
		            '_serialize' => ['success','message']
		        ]);
				return;
			}

			$query 	= $this->{$this->main_model}->find();
			$query->where(['IpPools.pool_name' => $name, 'IpPools.framedipaddress' => $current_ip]);

			$count = $query->count();

			if($count == 0){ //If already there we silently ignore it...
                $ipPoolEntity->pool_name = $name;
                $ipPoolEntity->framedipaddress 	= $current_ip;

				$this->{$this->main_model}->save($ipPoolEntity);
			}
			$current_ip = $next_ip;
			$next_ip	= $this->_get_next_ip($current_ip);
		}

		//Last one in the range
		if($current_ip == $end_ip){
			$query 	= $this->{$this->main_model}->find();
            $query->where(['IpPools.pool_name' => $name, 'IpPools.framedipaddress' => $current_ip]);

            $count = $query->count();

			if($count == 0){ //If already there we silently ignore it...
                $ipPoolEntity->pool_name = $name;
                $ipPoolEntity->framedipaddress 	= $current_ip;

                $this->{$this->main_model}->save($ipPoolEntity);
			}
		}

		$this->set([
            'success' => true,
            '_serialize' => ['success']
        ]);
	}

	public function addIp() {

        $cdata = $this->request->getData();
        
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

		//First check so we don't add doubles
		$name  	= $cdata['name'];
		$ip		= $cdata['ip'];

        $query 	= $this->{$this->main_model}->find();
        $query->where(['IpPools.pool_name' => $name, 'IpPools.framedipaddress' => $current_ip]);

        $count = $query->count();

        if($count > 0){
			$this->set([
	            'success'   => false,
	            'message'   => ['message' => "IP Already listed"],
	            '_serialize' => ['success','message']
	        ]);

		}else{
			$data 						= [];
			$data['pool_name'] 			= $name;
			$data['framedipaddress'] 	= $ip;

			$ipPoolEntity = $this->{$this->main_model}->newEntity($data);

			$this->{$this->main_model}->save($ipPoolEntity);

			$this->set([
		        'success' => true,
		        '_serialize' => ['success']
		    ]);
		} 
	}

    public function delete($id = null) {

        $cdata = $this->request->getData();

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
 
       	if (! $this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        $fail_flag = false;

	    if(null !== $cdata['id']){   //Single item delete
            $message = "Single item ".$cdata['id'];

            $ipPool = $this->{$this->main_model}->get($cdata['id']);

            $this->{$this->main_model}->delete($ipPool);
        }else{
            //Assume multiple item delete
            foreach($cdata as $d){
                $ipPool = $this->{$this->main_model}->get($d['id']);
                $this->{$this->main_model}->delete($ipPool);
            }
        }

        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
	}

    public function edit(){

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
		
		if ($this->request->is('post')) {
		 	//Unfortunately there are many check items which means they will not be in the POST if unchecked
            //so we have to check for them
            $check_items = [
				'active', 'clean_up'
			];

            foreach($check_items as $i){
                if(isset($cdata[$i])){
                    $cdata[$i] = 1;
                }else{
                    $cdata[$i] = 0;
                }
            }

			if($cdata['clean_up'] == 1){
				$cdata['nasipaddress'] 		= '';
				$cdata['calledstationid'] 	= '';
				$cdata['callingstationid'] 	= '';
				$cdata['expiry_time'] 		= '';
				$cdata['pool_key'] 			= '';
				$cdata['nasidentifier'] 		= '';
			}

			//Check if there was a user attached that we perhaps need to remove first...
			$q_r = $this->{$this->main_model}->find()->where(['id' => $cdata['id']])->first();
			if($q_r){
				if($q_r->permanent_user_id != ''){
                    $qry = $this->PermanentUsers->find()->where('id', $cdata['permanent_user_id'])->first();

                    $permanentUserEntity = $this->PermanentUsers->newEntity();

                    $permanentUserEntity->id = $q_r->permanent_user_id;
                    $permanentUserEntity->username = $qry->username;
                    $permanentUserEntity->static_ip = '';

                    $this->PermanentUsers->save($permanentUserEntity);
				}
			}

			//Find the username associated with the permanent_user_id
			$permanent_user_id = false;
			if($cdata['permanent_user_id'] != ''){

				$query = $this->PermanentUsers->find()->where('id', $cdata['permanent_user_id']);
				$q_r = $query->first();

				if($q_r){
					$cdata['username'] 	= $q_r->username;
					$permanent_user_id = $q_r->id;
				}else{
					$cdata['username'] = '';
				}
			}else{
				$cdata['username'] = '';
			}



			//We are only allowing to attach one permanent user / mac at a time to an IP Address
			if($cdata['username'] != ''){
				$username = $cdata['username'];
				$entry_id = $cdata['id'];

				$q_r = $this->{$this->main_model}->find()->where(['IpPools.username' => $username])->all();

				if($q_r){
					foreach($q_r as $i){
						if($i->id != $entry_id){
							$fip = $i->framedipaddress;
							$this->set([
								'success'   => false,
								'message'   => ['message' => "User $username already attached to $fip"],
								'_serialize' => ['success','message']
							]);
							return;
						}					
					}
				}
			}

			if($cdata['callingstationid'] != ''){
				$callingstationid 	= $cdata['callingstationid'];
				$entry_id 			= $cdata['id'];
				
                $q_r = $this->{$this->main_model}->find()->where(['IpPools.callingstationid' => $callingstationid])->all();

				if($q_r){
					foreach($q_r as $i){
						if($i->id != $entry_id){
							$fip = $i->framedipaddress;
							$this->set([
								'success'   => false,
								'message'   => ['message' => "MAC $callingstationid already attached to $fip"],
								'_serialize' => ['success','message']
							]);
							return;
						}					
					}
				}
			}

			$ipPoolEntity = $this->{$this->main_model}->newEntity($cdata);

            if ($this->{$this->main_model}->save($ipPoolEntity)) {
				
				//If there is a user attached, we need to also add this IP back to the user
				if($permanent_user_id){

                    $qry = $this->PermanentUsers->find()->where('id', $permanent_user_id)->first();

                    $permUserEntity = $this->PermanentUsers->newEntity();

                    $permUserEntity->id = $permanent_user_id;
                    $permUserEntity->username = $qry->username;
                    $permUserEntity->static_ip = '';

                    $this->PermanentUsers->save($permUserEntity);
				}	
               	$this->set([
                    'success' => true,
                    '_serialize' => ['success']
                ]);
            }
        }
    }

	public function getIpForUser(){
		if(isset($this->request->getQuery['username'])){
			$username 	= $this->request->getQuery['username'];

			//Test to see if username is not perhaps a BYOD device
			$pattern = '/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i';
			if(preg_match($pattern, $username)){
				$q_r = $this->Devices->find()->where(['Devices.name' => $username])->first();
				if($q_r){
					$permanent_user_id = $q_r->permanent_user_id;

					$q_s = 	$qry = $this->{$this->main_model}->find()->where(['IpPools.permanent_user_id' => $permanent_user_id])->first();
					if($q_s){
						$data = [];
						$data['ip'] = $q_s->framedipaddress;
						$this->set([
							'data' 		=> $data,
							'success'   => true,
							'_serialize' => ['success','data']
						]);
						return;
					}
				}
			}else{
                $query = $this->{$this->main_model}->find()->where(['IpPools.username' => $username]);
                $q_r = $query->first();

                if($q_r){
					$data 		= [];
					$data['ip'] = $q_r->framedipaddress;
					$this->set([
						'data' 		=> $data,
						'success'   => true,
						'_serialize' => ['success','data']
					]);
					return;
				}
			}
		}
		$this->set([
		    'success' => false,
		    '_serialize' => ['success']
		]);
	}

    //----- Menus ------------------------
    public function menuForGrid(){

        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }

            $menu = [
                ['xtype' => 'buttongroup','title' => __('Action'), 'items' => [
					[
                        'xtype'     => 'button', 
                        'glyph'     => Configure::read('icnReload'), 
                    'scale'     => 'large', 
                    'itemId'    => 'reload',      
                    'tooltip'   => __('Reload')
                ],
                [
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnAdd'), 
                    'scale'     => 'large', 
                    'itemId'    => 'add',      
                    'tooltip'   => __('Add')
                ],
                [
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnDelete'), 
                    'scale'     => 'large', 
                    'itemId'    => 'delete',   
                    'tooltip'   => __('Delete')
                ],
                [
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnEdit'), 
                    'scale'     => 'large', 
                    'itemId'    => 'edit',     
                    'tooltip'   => __('Edit')
                ]
            ]],
            ['xtype' => 'buttongroup','title' => __('Document'), 'width' => 100, 'items' => [
                [
                    'xtype'     => 'button',
                    'glyph'     => Configure::read('icnCsv'), 
                    'scale'     => 'large', 
                    'itemId'    => 'csv',      
                    'tooltip'   => __('Export CSV')
                ],
            ]]
        ];

        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
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
