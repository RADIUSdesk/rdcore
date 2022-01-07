<?php

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\ORM\TableRegistry;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class SluggableComponent extends Component {

    protected $slugs = [
        's_k'  => 'xJ3ktaC39H',
        's_iv' => 'anSYCDY1C9'//<-This one
    ];

    public function initialize(array $config){
        //Please Note that we assume the Controller has a JsonErrors Component Included which we can access.
        $this->controller       = $this->_registry->getController();
        $this->UserSettings     = TableRegistry::get('UserSettings'); 
        $this->Nodes            = TableRegistry::get('Nodes');
        $this->Aps              = TableRegistry::get('Aps'); 
    }
    
    public function getSlug($string, $action = 'e'){
        $encrypt_method     = "AES-256-CBC";
        $key = hash('sha256', $this->slugs['s_k']);
        $iv = substr(hash('sha256', $this->slugs['s_iv']), 0, 16); // sha256 is hash_hmac_algo
        if($action == 'e'){
            $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
            $output = base64_encode($output);
        }else if($action == 'd') {
            $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
        }
        return $output;
    }
    
    public function primeSlug(){  
        foreach(array_keys($this->slugs) as $k){
            $q_r = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => $k ])->first();
            if($q_r){
                $value = $this->slugs[$k];
                $this->{'UserSettings'}->patchEntity($q_r, ['value'=> $value]);
                $this->{'UserSettings'}->save($q_r);
            }else{
                $d = [];
                $d['name']      = $k;
                $d['value']     = $this->slugs[$k];
                $d['user_id']   = -1;
                $entity = $this->{'UserSettings'}->newEntity($d);
                $this->{'UserSettings'}->save($entity);
            }
        }
    }
    
    public function checkSlug(){    
        $data       = [];
        $data['l']  = base64_encode($this->_getLugL());
        $data['a']  = base64_encode($this->_getLugA());
        $data['m']  = base64_encode($this->_getLugM());
        $data['k']  = base64_encode($this->_getLug());
        return $data;      
    }
    
    private function _getLugL(){
        $l    = 0;
        $k    = $this->slugs['s_iv'];
        $s_l  = $this->_getLug();
        $d    = $this->getSlug($s_l, 'd');
        if(preg_match("/^$k::\d+::$k$/",$d)){
        
            $l = preg_replace("/^$k::/",'',$d);
            $l = preg_replace("/::$k$/",'',$l);
        }
        return $l;
    }
    
    private function _getLugA(){
        $a = $this->{'Aps'}->find()->count();
        return $a;
    }
    
    private function _getLugM(){
        $a = $this->{'Nodes'}->find()->count();
        return $a;   
    }
    
    private function _getLug(){
        $k = "Non Present";
        $q_r = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => 's_l'])->first();
        if($q_r){
            $k = $q_r->value;
        }
        return $k;   
    }
        
    public function testSlug($slug){
        $d    = $this->getSlug($slug, 'd');
        $k    = $this->slugs['s_iv'];
        if(preg_match("/^$k::\d+::$k$/",$d)){      
            return true;
        }
        return false;
    }   
}
