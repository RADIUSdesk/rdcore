<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class OpenvpnClientsTable extends Table {
	public $displayField = 'username';

    private $ccd_folder = '/etc/openvpn/ccd/';
    private $ip_half    = '10.8.';
	
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Nas');    
    }
    
    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('username', 'A value is required')
            ->add('username', [ 
                'nameUnique' => [
                    'message' => 'The username is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }
/* FFC 
  A number of beforeSave/AfterSave functions still need to be ported from the cake2 model to here
*/ 
    public function beforeSave($event,$entity,$options = []){

        //Try to detect if it is an existing (edit):
        $existing_flag = false;
        if(null !== $entity->OpenvpnClients->id){
            if($entity->OpenvpnClients->id != ''){
                $existing_flag = true;
            }
        }

        //First check if the $entity->OpenvpnClients->id is set
        if($existing_flag == true){ 
            //______ EXISTING ONE _______
            //This is the save of an existing one, check if the name did not change
            $new_username = '';
            if(null !== $entity->username){ //It may not always be set...
                $new_username = $entity->username;
            }else{
                return true; //They are not saving this field... return without doing the callback!
            }

            $qr = $this->findById($this->OpenvpnClients->id)->first();;
            $username = $qr->username;
            if($username != $new_username){
                //Name changed, remove old file
                $file       = $username;
                $filename   = $this->ccd_folder.$file;
                unlink($filename);
                //Create new file
                $this->_createNewFile();
            }
        }else{
            //_______________ NEW ONE _______________
            //This is a new one.... lets see if we can re-use some ip
            $q_r = $this->find()->order(['OpenvpnClients.subnet' => 'DESC', 'OpenvpnClients.peer1' => 'DESC'])->first();
            if($q_r){
                $top_subnet = $q_r->subnet;
                $top_peer1  = $q_r->peer1;
                if(($top_subnet == '')||($top_peer1 =='')){ //Return on empty values
                    return true;
                }
                //Start at the bottom
                $peer_start     = 1;
                $subnet_start   = 1;

                //Open find flag
                $find_flag = false;

                while($peer_start < $top_peer1){
                    if($this->_check_if_available($subnet_start,$peer_start)){
                        $entity->OpenvpnClients->subnet     =   $subnet_start;
                        $entity->OpenvpnClients->peer1      =   $peer_start;
                        $entity->OpenvpnClients->peer2      =   $peer_start+1;
                        $find_flag = true;
                        break;
                    }
                    $peer_start = $peer_start+4;
                    if($peer_start > 253){
                        $subnet_start = $subnet_start + 1;
                    }
                    if($subnet_start > $top_subnet){
                        break;
                    }
                }
                
                if($find_flag == false){
                    $new_peer_start = $top_peer1+4;
                    if($new_peer_start > 253){ //Roll over
                        $new_peer_start =  1;
                        $subnet_start  = $subnet_start+ 1; 
                    }
                    $entity->OpenvpnClients->subnet     =   $subnet_start;
                    $entity->OpenvpnClients->peer1      =   $new_peer_start;
                    $entity->OpenvpnClients->peer2      =   $new_peer_start+1;
                }
                
            }else{ //The very first entry
                $entity->OpenvpnClients->subnet     =   1;
                $entity->OpenvpnClients->peer1      =   1;
                $entity->OpenvpnClients->peer2      =   2;
            }
            return true;
        }
    }

    public function afterSave($created,$entity,$options = []) {

        if($created){
            //New addition; create a new file
            $this->_createNewFile();   
        }  
    }
/*
* FFC - deal with cascade in cake3
*/
    public function beforeDelete($event,$entity,$options = []) { // $cascade
        //Find the username which is just the filename
        $qr         = $this->findById($entity->id)->first();
        $file       = $qr->username;
        $filename   = $this->ccd_folder.$file;
        unlink($filename);
        return true;  
    }

    private function _check_if_available($subnet, $peer){

        $count = $this->find()->where(['OpenvpnClient.subnet' => $subnet,'OpenvpnClient.peer1' => $peer])->count();
        if($count == 0){
            return true;
        }else{
            return false;
        }
    }

    private function _createNewFile(){
        $file       = $this->OpenvpnClients->username;
        $filename   = $this->ccd_folder.$file;

        //ifconfig-push 10.8.0.1 10.8.0.2
        $p1 = $this->ip_half.$this->OpenvpnClients->subnet.'.'.$this->OpenvpnClients->peer1;
        $p2 = $this->ip_half.$this->OpenvpnClients->subnet.'.'.$this->OpenvpnClients->peer2;
        file_put_contents($filename,"ifconfig-push $p1 $p2\n",false);
    }

 
}
