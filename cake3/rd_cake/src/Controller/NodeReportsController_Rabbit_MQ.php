<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 10/01/2018
 * Time: 00:00
 */

namespace App\Controller;

use App\Controller\AppController;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;
use RabbitMQ\CakephpRabbitMQ as MQ;

class NodeReportsController extends AppController {

    protected $main_model = 'Nodes';
    private $nodeId;
    private $meshId;
    
    private $debug = true; //23April Add it to try and troubleshoot some nodes not being reported about   

    public function initialize(){
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('NodeActions');  
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');   
    }
    
    public function fb(){
        if($this->request->is('put')){
            $putdata = fopen("php://input", "r");

            /* Open a file for writing */
            $fp = fopen("/tmp/command_feedback.txt", "w");

            /* Read the data 1 KB at a time and write to the file */
            while ($data = fread($putdata, 1024))
              fwrite($fp, $data);

            /* Close the streams */
            fclose($fp);
            fclose($putdata);
        }
        exit;
    }

    public function wip(){
    
        $fb = []; 
       
        //$report_string  = file_get_contents('/home/system/NFW_61.2.9.70_00-25-82-03-A6-29');
        $report_string  = file_get_contents('/home/system/NFW_47.8.31.75_00-25-82-04-CA-BA');
        
        $report_array           = $this->print_r_reverse($report_string); 
        $this->request->data    = $report_array; 
        $fb                     = $this->_new_rabbit_report();    
        
        $this->set(array(
            'items'         => [],
            'success'       => true,
            '_serialize' => array('items', 'success','timestamp')
        ));
    }
     
    private function print_r_reverse($in) { 
        $lines = explode("\n", trim($in)); 
        if (trim($lines[0]) != 'Array') { 
            // bottomed out to something that isn't an array 
            return $in; 
        } else { 
            // this is an array, lets parse it 
            if (preg_match("/(\s{5,})\(/", $lines[1], $match)) { 
                // this is a tested array/recursive call to this function 
                // take a set of spaces off the beginning 
                $spaces = $match[1]; 
                $spaces_length = strlen($spaces); 
                $lines_total = count($lines); 
                for ($i = 0; $i < $lines_total; $i++) { 
                    if (substr($lines[$i], 0, $spaces_length) == $spaces) { 
                        $lines[$i] = substr($lines[$i], $spaces_length); 
                    } 
                } 
            } 
            array_shift($lines); // Array 
            array_shift($lines); // ( 
            array_pop($lines); // ) 
            $in = implode("\n", $lines); 
            // make sure we only match stuff with 4 preceding spaces (stuff for this array and not a nested one) 
            preg_match_all("/^\s{4}\[(.+?)\] \=\> /m", $in, $matches, PREG_OFFSET_CAPTURE | PREG_SET_ORDER); 
            $pos = array(); 
            $previous_key = ''; 
            $in_length = strlen($in); 
            // store the following in $pos: 
            // array with key = key of the parsed array's item 
            // value = array(start position in $in, $end position in $in) 
            foreach ($matches as $match) { 
                $key = $match[1][0]; 
                $start = $match[0][1] + strlen($match[0][0]); 
                $pos[$key] = array($start, $in_length); 
                if ($previous_key != '') $pos[$previous_key][1] = $match[0][1] - 1; 
                $previous_key = $key; 
            } 
            $ret = array(); 
            foreach ($pos as $key => $where) { 
                // recursively see if the parsed out value is an array too 
                $ret[$key] = $this->print_r_reverse(substr($in, $where[0], $where[1] - $where[0])); 
            } 
            return $ret; 
        } 
    } 
    
    public function submitReport(){
    
        $fb = $this->_new_rabbit_report();    
        $this->set(array(
            'items'         => $fb,
            'timestamp'     => $this->UptmTimestamp,
            'success'       => true,
            '_serialize' => array('items', 'success','timestamp')
        ));
    }
  
    public function _new_rabbit_report(){
        $items  = [];
        $mac    = $this->request->data['network_info']['eth0'];
        
        if($this->debug == true){ //Only the first one and only if debug is true
            $file_name = "/tmp/RABBIT_".$this->request->clientIp()."_".$mac;
            file_put_contents($file_name, print_r($this->request->data, true));
        } 
        
        
        $entity = $this->{$this->main_model}->find()->where(['Nodes.mac' => $mac])->first();
        if($entity){
            //Update the last contact detail
            $this->_update_last_contact($entity); 
            //Fetch commands awaiting for unit  
            $commands = $this->{'NodeActions'}->find()
                ->where([
                    'NodeActions.status'    => 'awaiting',
                    'NodeActions.node_id'   => $entity->id
                ])->all();
            foreach($commands as $c){
                array_push($items,$c->id);
            }
            $this->request->data['network_info']['id'] = $entity->id;
            MQ::send('single_mesh', json_encode($this->request->data));   
        }
        $this->UptmTimestamp = time();
        return $items;
    }
    
    private function _update_last_contact($entity){
    
        $entity->last_contact           = date("Y-m-d H:i:s", time());
        $entity->last_contact_from_ip   = $this->request->clientIp(); 
        
        //--- Check if there are any lan_info items here
        if (array_key_exists('lan_info', $this->request->data)) {
            $lan_proto  = $this->request->data['lan_info']['lan_proto'];
            $lan_gw     = $this->request->data['lan_info']['lan_gw'];
            $lan_ip     = $this->request->data['lan_info']['lan_ip'];
            $entity->lan_gw = $lan_gw;
            $entity->lan_ip = $lan_ip;
            $entity->lan_proto  = $lan_proto;  
        }
       
        if (array_key_exists('bootcycle', $this->request->data)) {
            $entity->bootcycle  = intval($this->request->data['bootcycle']); 
        }
        
        //--Check if we need to update the gateway field
        if (array_key_exists('gateway', $this->request->data)){
            if($entity->gateway !== $this->request->data['gateway']){
                $entity->gateway = $this->request->data['gateway']; //Set the gateway only if it is set and different
            }
        }     
        $this->{$this->main_model}->save($entity); 
        //Update the mesh last_contact
        $e_m = $this->{'Meshes'}->find()->where(['id' => $entity->mesh_id])->first();
        if($e_m){
            $data = [];
            $data['last_contact'] = date("Y-m-d H:i:s", time());
            $this->{'Meshes'}->patchEntity($e_m, $data);
            $this->{'Meshes'}->save($e_m);
        }  
    }
}
