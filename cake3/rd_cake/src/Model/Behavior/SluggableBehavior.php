<?php

namespace App\Model\Behavior;

use Cake\ORM\Behavior;
use Cake\ORM\TableRegistry;

class SluggableBehavior extends Behavior {

    protected $_defaultConfig = [
        'item' => 'one' //In future we can add more conventions
    ];
    
    protected $slugs = [
        's_k'  => 'xJ3ktaC39H',
        's_iv' => 'anSYCDY1C9'
    ];
    
    public function initialize(array $config){
        // Some initialization code here
        $this->UserSettings    = TableRegistry::get('UserSettings');
        
    }
    
    public function buildValidator($event,$validator,$name){
    
        $config     = $this->config();
        $item       = $config['item'];
       
        $validator->add('mac', 'custom', [
            'rule' => function ($value, $context){
                return $this->_doSlug();                
            },
            'message' => "Available License Slots Depleted"
        ]);
    }
    
    private function _doSlug(){ 
        $slug = false;
        $t = $this->_getLugA()+$this->_getLugM();
        if(($this->_getLugL()-$t)>0){      
            $slug = true;
        }     
        return $slug;
    }
       
    private function _getSlug($string, $action = 'e'){
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
    
    private function _getLug(){
        $k = "false";
        $q_r = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1, 'UserSettings.name' => 's_l'])->first();
        if($q_r){
            $k = $q_r->value;
        }
        return $k;   
    }
    
    private function _getLugL(){
        $l    = 0;
        $k    = $this->slugs['s_iv'];
        $s_l  = $this->_getLug();
        $d    = $this->_getSlug($s_l, 'd');
        if(preg_match("/^$k::\d+::$k$/",$d)){      
            $l = preg_replace("/^$k::/",'',$d);
            $l = preg_replace("/::$k$/",'',$l);
        }
        return $l;
    }
    
    private function _getLugA(){
        $t = $this->getTable();            
        if($t->table() == 'nodes'){
            $t = TableRegistry::get('Aps');            
        }
        $a = $t->find()->count();     
        return $a;
    }
    
    private function _getLugM(){
        $t = $this->getTable();            
        if($t->table() == 'aps'){
            $t = TableRegistry::get('Nodes');          
        }
        $a = $t->find()->count();    
        return $a;   
    }    
}

?>
