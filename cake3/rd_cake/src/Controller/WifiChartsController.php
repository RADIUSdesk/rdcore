<?php

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\Utility\Inflector;
use Cake\I18n\FrozenTime;
use Cake\I18n\Time;

class WifiChartsController extends AppController{
  
    public $base            = "Access Providers/Controllers/WifiCharts/";   
    protected $owner_tree   = [];
    protected $main_model   = 'Meshes';   
    protected $time_zone    = 'UTC'; //Default for timezone
    
    protected $graph_item   = 'ssid'; //ssid or node or device or ap or ap_device
    protected $ssid         = '';
    protected $node         = '';
    protected $mac          = '';
      
    protected $fields       = [
        'data_in'       => 'sum(tx_bytes)',
        'data_out'      => 'sum(rx_bytes)',
        'data_total'    => 'sum(tx_bytes) + sum(rx_bytes)'
    ];
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('Meshes'); 
        $this->loadModel('Users');
        $this->loadModel('Timezones');
        $this->loadModel('MacAliases'); 
        $this->loadModel('NodeStations');
        $this->loadModel('ApStations');   
        $this->loadComponent('Aa');
        $this->loadComponent('MacVendors');
        $this->loadComponent('CommonQuery', [ 
            'model'                     => 'Meshes',
            'no_available_to_siblings'  => false,
            'sort_by'                   => 'Meshes.name'
        ]);           
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');    
    }
    
    public function editMacAlias(){   
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
        
        $user_id = $user['id'];
        $list_of_macs = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $this->request->getData('mac')])->all();
        $entity = null;
        foreach($list_of_macs as $mac_alias){    
            if($mac_alias->user_id == $user_id){
                $entity = $mac_alias;
                break;
            }
        }
        
        $post_data              = $this->request->getData();
        $post_data['user_id']   = $user_id;
        
        if(isset($post_data['remove_alias'])){
            $this->{'MacAliases'}->delete($entity);
            $this->set([
                'success' => true,
                '_serialize' => array('success')
            ]);
            return;
        }	
        
        if($entity){
            $this->{'MacAliases'}->patchEntity($entity, $post_data);
        }else{
            $entity = $this->{'MacAliases'}->newEntity($post_data);
        }
        
        if ($this->{'MacAliases'}->save($entity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = __('Could not update item');
            $this->JsonErrors->entityErros($entity,$message);
        }
    }
    
    public function ApUsageForSsid(){
    
        //Try to determine the timezone if it might have been set ....       
        $this->_setTimeZone();
        $span       = $this->request->getQuery('span');  
        
        $this->loadModel('Aps');
        $ap_id          = $this->request->getQuery('ap_id');
        $mac            = $this->request->getQuery('mac');
        $ap_entry_id    = $this->request->getQuery('ap_entry_id');
        
        //FOR APdesk we add the AP as a start 
        $where_clause   = ['ApStations.ap_id' =>$ap_id];
        
        $this->graph_item = 'ap';
           
        $q_ap  = $this->{'Aps'}->find()
            ->where(['Aps.id' => $ap_id])
            ->contain(['ApProfiles' => 'ApProfileEntries'])->first();    
        if($q_ap){       
            $ap_profile_entries_list = [];
            foreach($q_ap->ap_profile->ap_profile_entries as $e){
                if($ap_entry_id == -1){ //Everyone
                    $this->ssid = "** ALL SSIDs **";
                    array_push($ap_profile_entries_list,['ApStations.ap_profile_entry_id' =>$e->id]);
                }else{
                    if($ap_entry_id == $e->id){ //Only the selected one 
                        $this->ssid = $e->name;
                        array_push($ap_profile_entries_list,['ApStations.ap_profile_entry_id' =>$e->id]);
                        break;
                    }  
                }     
            }
            array_push($where_clause,['OR' => $ap_profile_entries_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause;
            
            //IS this for a device
            if($mac !=='false'){
                $this->graph_item   = 'ap_device';
                $this->mac          = $mac;
                array_push($where_clause,['ApStations.mac' =>$mac]);
            }       
        }
        $this->base_search = $where_clause;
        
        //print_r($this->base_search); 
        
        //---- GRAPHS ----- 
        $ft_now = FrozenTime::now();
        $graph_items = []; 
        if($span == 'hour'){
            $graph_items    = $this->_getHourlyGraph($ft_now);
            $ft_start       = $ft_now->subHour(1);
        }
        if($span == 'day'){
            $graph_items = $this->_getDailyGraph($ft_now);
            $ft_start    = $ft_now->subHour(24);
        }
        if($span == 'week'){
            $graph_items = $this->_getWeeklyGraph($ft_now);
            $ft_start    = $ft_now->subHour((24*7));
        }
        
        //---- TOP TEN -----
        $top_ten    = $this->_getTopTen($ft_start,$ft_now);
        
        //---- TOTAL DATA ----
        $totals     = $this->_getTotals($ft_start,$ft_now);
        
        $data               = [];
        $data['graph']      = $graph_items;              
        $data['top_ten']    = $top_ten;
        $data['totals']     = $totals;
        
        if($this->graph_item == 'ap_device'){ 
            $data['device_info'] = $this->_device_info();
        }

        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);   
    }
    
    public function usageForSsid(){
    
        //Try to determine the timezone if it might have been set ....       
        $this->_setTimeZone();
        $span       = $this->request->getQuery('span');
        
        //==============================================
        //==== MESH ENTRIES ====
        $where_clause = [];
        if($this->request->getQuery('type')=='mesh_entries'){ 
        
            $this->graph_item = 'ssid';
                   
            $mesh_id        = $this->request->getQuery('mesh_id');
            $mesh_entry_id  = $this->request->getQuery('mesh_entry_id');
            $mac            = $this->request->getQuery('mac');
            $this->loadModel('MeshEntries');
            $me_list    = $this->{'MeshEntries'}->find()->where(['MeshEntries.mesh_id' => $mesh_id])->all();
            $mesh_entries_list = [];
            foreach($me_list as $me){
                if($mesh_entry_id == -1){ //Everyone
                    $this->ssid = "** ALL SSIDs **";
                    array_push($mesh_entries_list,['NodeStations.mesh_entry_id' =>$me->id]);
                }else{
                    if($mesh_entry_id == $me->id){ //Only the selected one 
                        $this->ssid = $me->name;
                        array_push($mesh_entries_list,['NodeStations.mesh_entry_id' =>$me->id]);
                        break;
                    }  
                }     
            }               
            array_push($where_clause,['OR' => $mesh_entries_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause;
            //IS this for a device
            if($mac !=='false'){
                $this->graph_item   = 'device';
                $this->mac          = $mac;
                array_push($where_clause,['NodeStations.mac' =>$mac]);
            }            
        }
        
        //==== MESH NODES ====
        if($this->request->getQuery('type')=='mesh_nodes'){ 
        
            $this->graph_item = 'node';
                   
            $mesh_id        = $this->request->getQuery('mesh_id');
            $node_id        = $this->request->getQuery('node_id');
            $mac            = $this->request->getQuery('mac');
            $this->loadModel('Nodes');
            $n_list         = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' => $mesh_id])->all();
            $nodes_list     = [];
            foreach($n_list as $n){
                if($node_id == -1){ //Everyone
                    $this->node = "** ALL NODES **";
                    array_push($nodes_list,['NodeStations.node_id' =>$n->id]);
                }else{
                    if($node_id == $n->id){ //Only the selected one 
                        $this->node = $n->name;
                        array_push($nodes_list,['NodeStations.node_id' =>$n->id]);
                        break;
                    }  
                }     
            }               
            array_push($where_clause,['OR' => $nodes_list]);
            $this->base_search_no_mac = $this->base_search = $where_clause;
            //IS this for a device
            if($mac !=='false'){
                $this->graph_item   = 'device';
                $this->mac          = $mac;
                array_push($where_clause,['NodeStations.mac' =>$mac]);
            }       
        }
        
        $this->base_search = $where_clause;        
        //==================================
        
                 
        //---- GRAPHS ----- 
        $ft_now = FrozenTime::now();
        $graph_items = []; 
        if($span == 'hour'){
            $graph_items    = $this->_getHourlyGraph($ft_now);
            $ft_start       = $ft_now->subHour(1);
        }
        if($span == 'day'){
            $graph_items = $this->_getDailyGraph($ft_now);
            $ft_start    = $ft_now->subHour(24);
        }
        if($span == 'week'){
            $graph_items = $this->_getWeeklyGraph($ft_now);
            $ft_start    = $ft_now->subHour((24*7));
        }
      
        //---- TOP TEN -----
        $top_ten    = $this->_getTopTen($ft_start,$ft_now);
        
        //---- TOTAL DATA ----
        $totals     = $this->_getTotals($ft_start,$ft_now);
      
        $data               = [];
        $data['graph']      = $graph_items;              
        $data['top_ten']    = $top_ten;
        $data['totals']     = $totals;
        
        //---- DATA PER NODE ---
        if($this->request->getQuery('type')=='mesh_nodes'){
            $data['node_data']  = $this->_getNodeData($ft_start,$ft_now);
        }      
        
        if($this->graph_item == 'device'){  
            $data['device_info'] = $this->_device_info();
        }
           
        $this->set([
            'data'          => $data,
            'success'       => true,
            '_serialize'    => ['data','success']
        ]);   
    }
    
    private function _getNodeData($ft_start,$ft_end){
        $node_data      = [];
        $table          = 'NodeStations'; //By default use this table  
        $where          = $this->base_search;     
        $fields         = $this->fields;
        array_push($fields, 'node_id');
        array_push($fields, 'Nodes.name');
        array_push($where, ["$table.modified >=" => $ft_start]);
        array_push($where, ["$table.modified <=" => $ft_end]);
              
        $q_r = $this->{$table}->find()->select($fields)
            ->where($where)
            ->order(['data_total' => 'DESC'])
            ->group(['node_id'])
            ->contain(['Nodes'])
            ->all();
               
        $id = 1;
        foreach($q_r as $ns){
            $name = $ns->node->name;
            array_push($node_data, 
                [
                    'id'            => $id,
                    'name'          => $name,
                    'data_in'       => $ns->data_in,
                    'data_out'      => $ns->data_out,
                    'data_total'    => $ns->data_total,
                ]
            );
            $id++;
        } 
        return $node_data;
    }
    
    private function _device_info(){
        $di             = [];      
        $where          = $this->base_search;
        $table          = 'NodeStations'; //By default use this table
        $contain        = ['MeshEntries','Nodes'];  
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table      = 'ApStations';
            $contain    = ['ApProfileEntries','Aps']; 
        }
                   
        $qr             = $this->{"$table"}->find()->where($where)->order(["$table.modified DESC"])->contain($contain)->first();
        if($qr){
            $di = $qr;
            $di['last_seen'] = $qr->modified->timeAgoInWords();
            $di['vendor']    = $this->MacVendors->vendorFor($this->mac);
            
            //CURRENT
            $signal     = round($qr->signal_now);
            if ($signal < -95) {
                $signal_bar = 0.01;
            }
            if (($signal >= -95)&($signal <= -35)) {
                    $p_val = 95-(abs($signal));
                    $signal_bar = round($p_val/60, 1);
            }
            if ($signal > -35) {
                $signal_bar = 1;
            }
            $di['signal_bar'] = $signal_bar;
                  
            //AVG
            $signal_avg     = round($qr->signal_avg);
            if ($signal_avg < -95) {
                $signal_avg_bar = 0.01;
            }
            if (($signal_avg >= -95)&($signal_avg <= -35)) {
                    $p_val = 95-(abs($signal_avg));
                    $signal_avg_bar = round($p_val/60, 1);
            }
            if ($signal_avg > -35) {
                $signal_avg_bar = 1;
            }
            $di['signal_avg_bar'] = $signal_avg_bar;     
            
        }       
        return $di;
    }
    
    private function _getHourlyGraph($ft_now){
        $items          = [];
        $start          = 0;
        $base_search    = $this->base_search;
        $hour_end       = $ft_now;   
        $slot_start     = $ft_now->subHour(1); 
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
        
        while($slot_start < $hour_end){
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addMinute(10)->subSecond(1);  
            $where          = $base_search;
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);   
            $slot_start     = $slot_start->addMinute(10); 
            $q_r            = $this->{$table}->find()->select($this->fields)->where($where)->first();

            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $start, 'time_unit' => $slot_start_h_m, 'data_in' => $d_in, 'data_out' => $d_out,'slot_start_txt' => $slot_start_h_m]);
            }
            $start++;
        }
        return(['items' => $items]);
    }
          
    private function _getDailyGraph($ft_now){
    
        $items          = [];
        $start          = 0;
        $base_search    = $this->base_search;
        $day_end        = $ft_now;//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_now->subHour(24);
        $slot_start     = $slot_start->minute(00); 
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
        
        
        while($slot_start < $day_end){  
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addHour(1)->subSecond(1);   
            $where          = $base_search;
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);    
            $slot_start     = $slot_start->addHour(1); 
            $q_r = $this->{$table}->find()->select($this->fields)->where($where)->first();

            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $start, 'time_unit' => $slot_start_h_m, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
            $start++;
        }
        return(['items' => $items]);
    }
    
     private function _getWeeklyGraph($ft_day){

        $items          = [];  
        $slot_start     = $ft_day->startOfWeek(); //Prime it 
        $count          = 0;
        $base_search    = $this->base_search;       
        $week_end       = $ft_day;
          
        $slot_start     = $ft_day->subHour(24*7);
        $slot_start     = $slot_start->minute(00);
        $table          = 'NodeStations';
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
       
        while($slot_start < $week_end){
        
            $where          = $base_search; 
            $slot_start_h_m = $slot_start->i18nFormat("E\nHH:mm",$this->time_zone);
            $slot_end       = $slot_start->addDay(1)->subSecond(1); //Our interval is one day      
            array_push($where, ["modified >=" => $slot_start]);
            array_push($where, ["modified <=" => $slot_end]);    
            $slot_start     = $slot_start->addDay(1);                 
            $q_r            = $this->{$table}->find()->select($this->fields)->where($where)->first();          
            if($q_r){
                $d_in   = $q_r->data_in;
                $d_out  = $q_r->data_out;
                array_push($items, ['id' => $count, 'time_unit' => $slot_start_h_m, 'data_in' => $d_in, 'data_out' => $d_out]);
            }
            $count++;
        }
        return(['items' => $items]);
    }
    
    private function _getTopTen($ft_start,$ft_end){
    
        $top_ten        = [];
        $limit          = 10;
        $where          = $this->base_search_no_mac;
        $table          = 'NodeStations'; //By default use this table
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
        
        $fields         = $this->fields;
        array_push($fields, 'mac');
        array_push($where, ["modified >=" => $ft_start]);
        array_push($where, ["modified <=" => $ft_end]);
              
        $q_r = $this->{$table}->find()->select($fields)
            ->where($where)
            ->order(['data_total' => 'DESC'])
            ->group(['mac'])
            ->limit($limit)
            ->all();
    
        $id = 1;
        foreach($q_r as $tt){
            $mac        = $tt->mac;
            $name       = $mac;
            $alias      = '';
            $alias_name = $this->_find_alias($mac);
            $vendor     = $this->MacVendors->vendorFor($mac);
            if($alias_name){
                $name = $alias_name;
                $alias= $alias_name;
            }
            array_push($top_ten, 
                [
                    'id'            => $id,
                    'mac'           => $tt->mac,
                    'vendor'        => $vendor,
                    'alias'         => $alias,
                    'name'          => $name,
                    'data_in'       => $tt->data_in,
                    'data_out'      => $tt->data_out,
                    'data_total'    => $tt->data_total,
                ]
            );
            $id++;
        } 
        return $top_ten;
    }
    
    private function _getTotals($ft_start,$ft_end){
    
        $table  = 'NodeStations';
        $where  = $this->base_search;
        
        if(($this->graph_item == 'ap')||($this->graph_item == 'ap_device')){
            $table = 'ApStations';
        }
                  
        $totals = [];
        $totals['data_in']      = 0;
        $totals['data_out']     = 0;
        $totals['data_total']   = 0;
      
        array_push($where, ["modified >=" => $ft_start]);
        array_push($where, ["modified <=" => $ft_end]);
          
        $q_r = $this->{$table}->find()->select($this->fields)->where($where)->first();
        if($q_r){
            $totals['data_in']      = $q_r->data_in;
            $totals['data_out']     = $q_r->data_out;
            $totals['data_total']   = $q_r->data_total;
            
            $totals['graph_item']   = $this->graph_item;
            $totals['ssid']         = $this->ssid;
            $totals['node']         = $this->node;
            $totals['mac']          = $this->mac;
            $alias                  = $this->_find_alias($this->mac);
            if($alias){
                $totals['mac']     = $alias;
            }   
        }   
        return $totals;   
    }
     
    private function _find_alias($mac){  
        $alias = false;
        $qr = $this->{'MacAliases'}->find()->where(['MacAliases.mac' => $mac])->all(); 
        foreach($qr as $a){
            $alias = $a->alias;
        }  
        return $alias;
    }
       
    private function _setTimezone(){ 
        //New way of doing things by including the timezone_id
        if($this->request->getQuery('timezone_id') != null){
            $tz_id = $this->request->getQuery('timezone_id');
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $tz_id])->first();
            if($ent){
                $this->time_zone = $ent->name;
            }
        }
    }    
    
}
