<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class RadchecksController extends AppController{
  
    public $base         = "Access Providers/Controllers/Radchecks/";   
    protected $owner_tree   = array();
    protected $main_model   = 'Radchecks';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Users');
        $this->loadComponent('Aa');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'Radchecks'
        ]);
                
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');        
    }
    
	public function get_profile_for_user(){

		if(
			isset($this->request->query['username'])
		){

			$username		= $this->request->query['username'];
			$profile		= false;
			$q_r 			= $this->Radchecks->find()->where(['Radcheck.username' => $username,'Radcheck.attribute' => 'User-Profile'])->first();
			if($q_r){
			    $profile = $q_r['value'];
			}

			$data = array('profile' => $profile);
			$this->set(array(
                'success'   => true,
                'data'      => $data,
                '_serialize' => array('success','data')
            ));

		}else{
			$this->set(array(
                'success'   => false,
                'message'   => array('message' => "Require a valid MAC address and username in the query string"),
                '_serialize' => array('success','message')
            ));
		}
	}
}
?>
