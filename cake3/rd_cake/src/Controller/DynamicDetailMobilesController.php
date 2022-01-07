<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 07/08/2021
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


class DynamicDetailMobilesController extends AppController {

    public $base            = "Access Providers/Controllers/DynamicDetailMobiles/";
    protected $owner_tree   = [];
    protected $main_model   = 'DynamicDetailMobiles';
    
    
    public function initialize(){
        parent::initialize();
        $this->loadComponent('Aa');      
        $this->loadModel('DynamicDetailMobiles');
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }
      
    public function view(){
        $data = [];
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id    = $user['id'];

        if(isset($this->request->query['dynamic_detail_id'])){
        
            $dd_id = $this->request->query['dynamic_detail_id'];
            $q_r = $this->{$this->main_model}
                ->find()
                ->where(['DynamicDetailMobiles.dynamic_detail_id' => $dd_id])
                ->first();

            if($q_r){
                $data = $q_r;    
			
            }       
        }
                 
        $this->set([
            'data'      => $data,
            'success'   => true,
            '_serialize'=> ['success', 'data']
        ]); 
    }
    
    public function save(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id        = $user['id'];            
        $check_items    = [
			'mobile_only',
			'android_enable',
			'apple_enable'
		];
		$r_data     = $this->request->getData();
		
        foreach($check_items as $i){
            if(isset($r_data[$i])){
                $r_data[$i] = 1;
            }else{
                $r_data[$i] = 0;
            }
        }  
        
        $q_r = $this->{$this->main_model}
            ->find()
            ->where(['DynamicDetailMobiles.dynamic_detail_id' => $r_data['dynamic_detail_id']])
            ->first();
        if($q_r){      
            $this->{$this->main_model}->patchEntity($q_r, $r_data);
        }else{
            $q_r = $this->{$this->main_model}->newEntity($r_data); 
        }      
        $this->{$this->main_model}->save($q_r);               
        $this->set([
            'success'   => true,
            '_serialize'=> ['success']
        ]); 
    }
}
