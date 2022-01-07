<?php
namespace App\Controller;
use Cake\I18n\FrozenTime;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class NetworkOverviewsController extends AppController {

    protected   $base_search        = false;
    protected   $time_zone          = 'UTC'; //Default for timezone
   // protected   $time_zone            = 'Africa/Johannesburg';
    protected   $dailies_stopped    = false;

    protected $fields   = [
        'tx_bytes'      => 'sum(tx_bytes)',
        'rx_bytes'      => 'sum(rx_bytes)',
        'total_bytes'   => 'sum(tx_bytes) + sum(rx_bytes)',
        'avg_signal'    => 'avg(signal_avg)'
    ];
    
    public function initialize(){
    
        parent::initialize();
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadModel('MeshEntries');
        $this->loadModel('NodeStations');
        $this->loadModel('NodeStationsDailies');
        $this->loadModel('UserSettings');
        
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('Formatter');
        $this->loadComponent('MacVendors');
    }

    public function overviewFor(){
        $data   = [];       
        $day    = $this->request->getQuery('day'); //day will be in format 'd/m/Y'   
        if($day){
            $ft_day = FrozenTime::createFromFormat('d/m/Y',$day);     
        }else{
            $ft_day = FrozenTime::now();
        }     
        
        //Get the basic search
        $this->base_search = $this->_base_search();
        //See if there is a dailies timestamp
        $e_us = $this->{'UserSettings'}->find()->where(['UserSettings.user_id' => -1,'UserSettings.name' => 'NodeStationsDailiesStoppedAt'])->first(); 
        
        if($e_us){
            $this->dailies_stopped = FrozenTime::createFromTimestamp($e_us->value);
        }       
        //Feedback on requested query     
        $data['query_info']['date']         = $ft_day->i18nFormat('yyyy-MM-dd');
        $data['query_info']['date_human']   = $ft_day->timeAgoInWords();
        $data['query_info']['type']         = $this->type;
        $data['query_info']['item_name']    = $this->item_name;
        $data['query_info']['item_id']      = $this->item_id;
        
        $data['weekly']['graph']            = $this->_getWeeklyGraph($ft_day);
        $data['weekly']['nodes_usages']     = $this->_getNodesUsages($ft_day,'week');
        $data['weekly']['top_stations']     = $this->_getTopTenStations($ft_day,'week');
        $data['monthly']['graph']           = $this->_getMonthlyGraph($ft_day);
        $data['monthly']['nodes_usages']    = $this->_getNodesUsages($ft_day,'month');
        $data['monthly']['top_stations']    = $this->_getTopTenStations($ft_day,'month');
        
        $this->set([
            'data' => $data,
            'success' => true,
            '_serialize' => ['data','success']
        ]);
    }
       
    private function _getWeeklyGraph($ft_day){

        $items          = [];
        $week_end       = $ft_day->endOfWeek();//->i18nFormat('yyyy-MM-dd HH:mm:ss');    
        $slot_start     = $ft_day->startOfWeek(); //Prime it 
        $count          = 0;
        $base_search    = $this->base_search;
        $days           = ["Monday", "Tuesday","Wednesday", "Thusday", "Friday", "Saturday", "Sunday"];
        $group_ids      = [];
       
        while($slot_start < $week_end){
        
            //Logic to determine which table to use
            $table = 'NodeStationsDailies';
            if($this->dailies_stopped ){
                if($this->dailies_stopped > $slot_start){
                    $table = 'NodeStationsDailies';
                }else{
                    $table = 'NodeStationsDailies';
                }
            }

            $where              = $base_search; 
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day     
            
            $query = $this->{$table}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            array_push($where, ["timestamp >=" => $time_start]);
            array_push($where, ["timestamp <=" => $time_end]);
            
            $item = [
                'time_unit' => $days[$count]
            ];          
            $series = [];       
            $fields = $this->fields;
            array_push($fields, 'node_id');
            $q_r = $this->{$table}->find()
                ->select($fields)
                ->where($where)
                ->group(['node_id'])
                ->all();          
            foreach($q_r as $ent){   
                $tx_bytes  = $ent->tx_bytes;
                $rx_bytes  = $ent->rx_bytes;
                $total_bytes = $tx_bytes + $rx_bytes;
                $item["data_".$ent->node_id] = $total_bytes; 
                if(!in_array($ent->node_id,$group_ids)){
                    array_push($group_ids,$ent->node_id);
                }            
            }
            array_push($items, $item);
            
            $slot_start = $slot_start->addDay(1);
            $count ++;
        }
        
        
        $ret_arr['items']   = $items;   
        $series             = [];
        foreach($group_ids as $gid){
        
            $q_n = $this->{'Nodes'}->find()->where(['Nodes.id' => $gid])->first();
            $title = "UNKNOWN ".$gid;
            if($q_n){
                $title = $q_n->name;
            }
            array_push($series, [
                'type'      => 'line',
                'title'     => $title,
                'xField'    => 'time_unit',
                'yField'    => 'data_'.$gid,
                'style'     => [
                    'lineWidth'     => 2
                ]
            ]);
        }       
        $ret_arr['series']= $series;            
        return($ret_arr);
    }
      
    private function _getMonthlyGraph($ft_day){
        $items          = [];        
        $slot_start     = $ft_day->startOfMonth(); 
        $month_end      = $ft_day->endOfMonth();  
        $base_search    = $this->base_search;
        $id_counter     = 1;
        $group_ids      = [];
                 
        while($slot_start < $month_end){
        
            //Logic to determine which table to use
            $table = 'NodeStationsDailies';
            if($this->dailies_stopped ){
                if($this->dailies_stopped > $slot_start){
                    $table = 'NodeStationsDailies';
                }else{
                    $table = 'NodeStationsDailies';
                }
            }
                   
            $where              = $base_search;  
            $slot_start_txt     = $slot_start->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $slot_start->addDay(1)->subSecond(1)->i18nFormat('yyyy-MM-dd HH:mm:ss'); //Our interval is one day
            
            $query = $this->{$table}->find();
            $time_start = $query->func()->CONVERT_TZ([
                "'$slot_start_txt'"     => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            
            $time_end = $query->func()->CONVERT_TZ([
                "'$slot_end_txt'"       => 'literal',
                "'$this->time_zone'"    => 'literal',
                "'+00:00'"              => 'literal',
            ]);
            array_push($where, ["timestamp >=" => $time_start]);
            array_push($where, ["timestamp <=" => $time_end]);
                     
            $item = [
                'id'            => $id_counter, 
                'time_unit'     => $slot_start->day
            ];          
            $series = [];       
            $fields = $this->fields;
            array_push($fields, 'node_id');
            $q_r = $this->{$table}->find()
                ->select($fields)
                ->where($where)
                ->group(['node_id'])
                ->all();          
            foreach($q_r as $ent){   
                $tx_bytes  = $ent->tx_bytes;
                $rx_bytes  = $ent->rx_bytes;
                $total_bytes = $tx_bytes + $rx_bytes;
                $item["data_".$ent->node_id] = $total_bytes; 
                if(!in_array($ent->node_id,$group_ids)){
                    array_push($group_ids,$ent->node_id);
                }            
            }
            array_push($items, $item);
            
            $slot_start = $slot_start->addDay(1);
            $id_counter ++;
        }
        
        $ret_arr['items']   = $items;   
        $series             = [];
        foreach($group_ids as $gid){
        
            $q_n = $this->{'Nodes'}->find()->where(['Nodes.id' => $gid])->first();
            $title = "UNKNOWN ".$gid;
            if($q_n){
                $title = $q_n->name;
            }
            array_push($series, [
                'type'      => 'line',
                'title'     => $title,
                'xField'    => 'time_unit',
                'yField'    => 'data_'.$gid,
                'style'     => [
                    'lineWidth'     => 2
                ]
            ]);
        }       
        $ret_arr['series']= $series;            
        return($ret_arr);
    } 
    
    private function _base_search(){

        $base_search    = [];  
        if($this->request->getQuery('type') !== null){
            $this->type     = $this->request->getQuery('type');
            $this->item_id  = $this->request->getQuery('item_id');
        }
        
        if($this->type == 'mesh'){      
            $ent = $this->{'Meshes'}->find()->where(['Meshes.id' => $this->item_id])->first();
            if($ent){
                    $this->item_name = $ent->name;
                     array_push($base_search, ['NodeStationsDailies.mesh_id' => $this->item_id]);
            }
        }
        return $base_search;
    }
    
    private function _getTopTenStations($ft_day,$span){
        $items          = [];   
        $where          = $this->base_search;
        $id             = 1;    
        $table          = 'NodeStationsDailies'; //By default use this table
        
    
        if($span == 'day'){
            $slot_start_txt     = $ft_day->startOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
        
        if($span == 'week'){      
            $slot_start_txt     = $ft_day->startOfWeek()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfWeek()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
           
        if($span == 'month'){       
            $slot_start_txt     = $ft_day->startOfMonth()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfMonth()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
        
         $query = $this->{$table}->find();
        $time_start = $query->func()->CONVERT_TZ([
            "'$slot_start_txt'"     => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        
        $time_end = $query->func()->CONVERT_TZ([
            "'$slot_end_txt'"       => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        array_push($where, ["timestamp >=" => $time_start]);
        array_push($where, ["timestamp <=" => $time_end]);
        
        $fields = $this->fields;
        array_push($fields, 'mac');
        
         $q_r = $this->{$table}->find()
            ->select($fields)
            ->where($where)
            ->group(['mac'])
            ->order(['total_bytes' => 'DESC'])
            ->limit(10)
            ->all();
          
        foreach($q_r as $node){
            $item = [
                'id'            => $id,
                'mac'           => $node->mac,
                'vendor'        => $this->MacVendors->vendorFor($node->mac),
                'tx_bytes'      => $node->tx_bytes,
                'rx_bytes'      => $node->tx_bytes,
                'total_bytes'   => intval($node->total_bytes),
                'avg_signal'    => $node->avg_signal
            ];
            $id++;
            array_push($items,$item);
        } 
        return $items; 
    
    
    }
    
    private function _getNodesUsages($ft_day,$span){
        $items          = [];   
        $where          = $this->base_search;
        $id             = 1;    
        $table          = 'NodeStationsDailies'; //By default use this table
        
    
        if($span == 'day'){
            $slot_start_txt     = $ft_day->startOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfDay()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
        
        if($span == 'week'){      
            $slot_start_txt     = $ft_day->startOfWeek()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfWeek()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
           
        if($span == 'month'){       
            $slot_start_txt     = $ft_day->startOfMonth()->i18nFormat('yyyy-MM-dd HH:mm:ss');
            $slot_end_txt       = $ft_day->endOfMonth()->i18nFormat('yyyy-MM-dd HH:mm:ss');
        }
        
        $query = $this->{$table}->find();
        $time_start = $query->func()->CONVERT_TZ([
            "'$slot_start_txt'"     => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        
        $time_end = $query->func()->CONVERT_TZ([
            "'$slot_end_txt'"       => 'literal',
            "'$this->time_zone'"    => 'literal',
            "'+00:00'"              => 'literal',
        ]);
        array_push($where, ["timestamp >=" => $time_start]);
        array_push($where, ["timestamp <=" => $time_end]);
        
        $fields = $this->fields;
        array_push($fields, 'node_id');
        
        $q_r = $this->{$table}->find()
            ->select($fields)
            ->where($where)
            ->group(['node_id'])
            ->contain(['Nodes'])
            ->order(['total_bytes' => 'DESC'])
            ->all();          
        
        foreach($q_r as $node){
            $q_n = $this->{'Nodes'}->find()->where(['Nodes.id' => $node->node_id])->first();
            $title = "UNKNOWN";
            if($q_n){
                $title = $q_n->name;
            }
            $item = [
                'id'            => $id,
                'node_id'       => $node->node_id,
                'name'          => $title,
                'tx_bytes'      => $node->tx_bytes,
                'rx_bytes'      => $node->tx_bytes,
                'total_bytes'   => intval($node->total_bytes),
                'avg_signal'    => $node->avg_signal
            ];
            $id++;
            array_push($items,$item);
        } 
        return $items; 
    }    
    
    private  function _isValidMac($mac){
        return (preg_match('/([a-fA-F0-9]{2}[:|\-]?){6}/', $mac) == 1);
    }
     
}
