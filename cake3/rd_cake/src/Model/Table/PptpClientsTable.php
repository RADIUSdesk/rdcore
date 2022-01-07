<?php
namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PptpClientsTable extends Table {
	
    public function initialize(array $config){
        $this->addBehavior('Timestamp');
        $this->belongsTo('Nas');    
    }

    public function validationDefault(Validator $validator){
        $validator = new Validator();
        $validator
            ->notEmpty('nasname', 'A name is required')
            ->add('nasname', [ 
                'nameUnique' => [
                    'message' => 'The name you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ])
			->notEmpty('password', 'A password is required')
            ->add('password', [ 
                'nameUnique' => [
                    'message' => 'The password you provided is already taken. Please provide another one.',
                    'rule' => 'validateUnique', 
                    'provider' => 'table'
                ]
            ]);
        return $validator;
    }

    public function beforeSave($event,$entity,$options = []){

        //Try to detect if it is an existing (edit):
        $existing_flag = false;
        if(null !== $entity->id){
            if($entity->id != ''){
                $existing_flag = true;
            }
        }

        //First check if the $entity->id is set
        if($existing_flag == true){ 
            //______ EXISTING ONE _______
            //This is the save of an existing one, check if the name did not change
            $new_username = '';
            if(null !== $entity->username){ //It may not always be set...
                $new_username = $entity->username;
            }else{
                return true; //They are not saving this field... return without doing the callback!
            }

            $qr = $this->findById($this->PptpClients->id)->first();
            $username = $qr->username;
            if($username != $new_username){
                //Name changed, remove old entry
                $this->_removeFromChapSecrets();
                //Add new one
                $this->_addToChapSecrets();
                
            }
        }else{
            //_______________ NEW ONE _______________
            //This is a new one.... lets see if we can re-use some ip
            $q_r = $this->find()->order(['PptpClients.ip' => 'ASC'])->first();
            if($q_r){
                $ip         = $q_r->ip;
                $next_ip    = $this->_get_next_ip($ip);           
                $not_available = true;
                while($not_available){
                    if($this->_check_if_available($next_ip)){
                        $this->$entity->PptpClients->ip     = $next_ip;
                        $not_available = false;
                        break;
                    }else{
                        $next_ip = $this->_get_next_ip($next_ip);
                    }
                }              
            }else{ //The very first entry
                $ip                                  = Configure::read('pptp.start_ip');
                $this->$entity->PptpClients->ip	     = $ip;
            }
            return true;
        }
    }
/*
* FFC Following methods need to be verified/ported
*/
    public function afterSave($created,$entity,$options = []) {
        if($created){
            //New addition; add to chap secrets
            $this->_addToChapSecrets();   
        }  
    }
	
    public function beforeDelete($event,$entity,$options  = []) {			// cascade now on models (see Cake3 docs - >,$cascade = true) {
        $this->_removeFromChapSecrets();
        return true;  
    }

    private function _check_if_available($ip){
        $count = $this->find()->where(['PptpClients.ip' => $ip])-count();
        if($count == 0){
            return true;
        }else{
            return false;
        }
    }

    private function _addToChapSecrets(){
        $chap_file  = Configure::read('pptp.chap_secrets');
        $un         = $this->data['PptpClient']['username'];
        $pwd        = $this->data['PptpClient']['password'];
        $ip         = $this->data['PptpClient']['ip'];
        $handle     = fopen($chap_file, 'a');
        $data       = $un.' pptpd '.$pwd.' '.$ip."\n";
        fwrite($handle, $data);
        fclose($handle);
    }

	
	private function _removeFromChapSecrets(){

         //Find the username which is just the filename
        $qr         = $this->findById($this->id)->first();
		//$qr = $this->Nas->OpenvpnClients->findById($this->Nas->OpenvpnClients->id)->first();
		//$qr->subnet
        $ip         = $qr->ip;
        $un         = $qr->username;
        $chap_file  = Configure::read('pptp.chap_secrets');
        $content    = file($chap_file);

        $new_content= [];

        foreach($content as $line){

            $line = ltrim($line);
            $match_found = false;
            if(preg_match("/^$un/",$line)){

                if(preg_match("/$ip/",$line)){
                    $match_found = true;
                }
            }
            if($match_found == false){
                array_push($new_content,$line);
            }
        }

         // open the file for reading
        if (!$fp = fopen($chap_file, 'w+')){
            // print an error
            print "Cannot open file ($chap_file)";
            // exit the function
            exit;
        }
        // if $fp is valid
        if($fp)
        {
            // write the array to the file
            foreach($new_content as $line) { fwrite($fp,$line); }
            // close the file
            fclose($fp);
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
