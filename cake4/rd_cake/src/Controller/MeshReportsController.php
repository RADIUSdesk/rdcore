<?php
// WIP Demo
namespace App\Controller;

use Cake\I18n\FrozenTime;
use Cake\Core\Configure;
use GuzzleHttp\Client;


class MeshReportsController extends AppController {

    private $blue       = '#627dde';
    private $l_red      = '#fb6002';
    private $d_red      = '#dc1a1a';
    private $l_green    = '#4bd765';
    private $d_green    = "#117c25";
    private $green      = '#01823d';    //Green until dead time then grey
    private $dark_blue  = '#0a3cf6';    //Blue until dead time then grey
    private $grey       = '#505351';    //Green until dead time then grey
    private $blue_grey  = '#adbcf6';    //Blue until dead time then blue_grey
    private $yellow     = '#f8d908';
    private $thickness  = 9;
    private $gw_size    = 20;
    private $node_size  = 10;
    
    private $timespan   = 'hour';
    
    private $MeshMacLookup = [];
    
    protected $fields   = [
        'tx_bytes'      => 'SUM(tx_bytes)',
        'rx_bytes'      => 'SUM(rx_bytes)',
        'signal_avg'    => 'AVG(signal_avg)',
    ];

    public function initialize():void
    {
        parent::initialize();
        //$this->loadModel($this->main_model);
        $this->loadModel('Nodes');
        $this->loadModel('NodeLoads');
        $this->loadModel('NodeStations');
        $this->loadModel('NodeStationHourlies');
        $this->loadModel('NodeSystems');
        $this->loadModel('MeshEntries');
        $this->loadModel('Meshes');
        $this->loadModel('NodeIbssConnections');
        $this->loadModel('NodeSettings');
        $this->loadModel('NodeNeighbors');
        $this->loadModel('NodeActions');
        $this->loadModel('MeshExits');
        $this->loadModel('OpenvpnServerClients');
        
        $this->loadModel('MacActions');
        $this->loadModel('MacAddresses');
        
        $this->loadModel('Hardwares');
        $this->loadModel('Timezones'); 
        $this->loadModel('MacAliases');
        
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model' => 'Meshes'
        ]); 

        $this->loadComponent('Aa');
        $this->loadComponent('TimeCalculations');
        $this->loadComponent('LteHelper');
    }
    
     private function print_r_reverse($in){ 
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
 
    public function overview(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }
        
        $req_q    = $this->request->getQuery();

        if (!isset($req_q['mesh_id'])) {
            $this->set([
                'message'   => "Mesh ID (mesh_id) missing",
                'success' => false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }

        //Create a hardware lookup for proper names of hardware
        $hardware = $this->_make_hardware_lookup();
    
        $items      = [];
        $mesh_id    = $req_q['mesh_id'];

        //Get the 'dead_after' value
        $dead_after = $this->_get_dead_after($mesh_id);

        //Find all the nodes for this mesh with their Neighbors

        $ent_nodes  = $this->{'Nodes'}->find()->contain(['NodeNeighbors'])->where(['Nodes.mesh_id' => $mesh_id])->all();
    
        $grey_list      = array(); //List of nodes with no neighbors
        //===No Nodes found===
        if (count($ent_nodes)==0) {
            $items = [
                [
                    'id'    => "empty1",
                    'name'  => "Please add nodes.....",
                    'data'  => [
                        '$color'    => $this->yellow,
                        '$type'     => "star",
                        '$dim'      => 30
                    ]
                ]
            ];
            array_push($grey_list, array( 'nodeTo' => "empty1",'data' => array('$alpha'  => 0.0)));
        }

        //Some defaults for the spiderweb
        $opacity        = 1;    //The older a line is the more opacity it will have (tend to zero)
        $cut_off        = 3 * $dead_after;//Three times ater it will turn red
        $no_neighbors   = true;     //If none of the nodes has neighbor entries this will stay true
        

        foreach ($ent_nodes as $i) {       
        
            $node_id    = $i->id;
            $node_name  = $i->name;
            $l_contact  = $i->last_contact;
            $hw_id      = $i->hardware;
            $hw_human   = $hardware["$hw_id"]['name'];  //Human name for Hardware
            $hw_photo   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware
            $type       = 'node';
            $config_fetched = $i->config_fetched;
            
            $node_data  = [];
            
            $fields     = $this->{'Nodes'}->getSchema()->columns();
            foreach($fields as $field){
                $node_data["$field"]= $i->{"$field"};
            } 
            
            if($i->gateway !== 'none'){ 
                $img = "/cake4/rd_cake/img/hardwares/lan_internet.png"; 
                if($i->gateway == 'wifi'){
                    $img = "/cake4/rd_cake/img/hardwares/wifi_internet.png";    
                }         
                //This is the gateway -> Add an Internet connection to it
                $gw_adj = [[
                    "nodeTo" => $i->id,
                    "data" => [
                        '$color' => "#3d3d3d",
                        '$lineWidth' => 9,
                        '$alpha' => 0.6
                    ]
                ]];
                $gw_data = [
                    '$type' => "image",
                    '$url'  => $img,
                    "type"  => "gateway"
                ];    
                array_push($items, ['id'=> 0,'name'=> 'Internet', 'data' => $gw_data,'adjacencies'=> $gw_adj]); 
            }
            
                
            //===Determine when last did we saw this node (never / up / down) ====
            if ($l_contact == null) {
                $state = 'never';
                $node_data['last_contact_human'] = null;
            } else {
                $node_data['last_contact_human'] = $this->TimeCalculations->time_elapsed_string($l_contact);
                $last_timestamp = strtotime($l_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $state = 'down';
                } else {
                    $state = 'up';
                }
            }
            
            if($config_fetched == null){
                $node_data['config_fetched_human'] = 'Never';
            }else{
                $node_data['config_fetched_human'] = $this->TimeCalculations->time_elapsed_string($config_fetched);
            }
            
            //===Specify the color based on the state + gw type
            if ($state == 'never') {
                $color  = $this->blue;  //Default
                $size   = $this->node_size;
            }

            if (($state == 'down')&($i->gateway == 'none')) {
                $color  = $this->l_red;
                $size   = $this->node_size;
            }

            if (($state == 'up')&($i->gateway == 'none')) {
                $color = $this->l_green;
                $size  = $this->node_size;
            }

            if (($state == 'down')&($i->gateway !== 'none')) {
                $color  = $this->d_red;
                $size   = $this->gw_size;
                $type   = 'gateway';
            }

            if (($state == 'up')&($i->gateway !== 'none')) {
                $color  = $this->d_green;
                $size   = $this->gw_size;
                $type   = 'gateway';
            }

            //=== add extra info to node data ===
            $node_data['state']     = $state;
            $node_data['hw_human']  = $hw_human;
            $node_data['hw_photo_file_name'] = $hw_photo;
            
            if (count($i->node_neighbors) == 0) {     //We handle nodes without any entries as blue nodes

                $specific_data = [
                    ////'$color'        => "$color",
                    ////'$type'             => "circle",
                    ////'$dim'          => $size,
                    'type'          => 'no_neighbors',
                    
                    '$type'     => "image",
                    '$url'      => "/cake4/rd_cake/img/hardwares/".$node_data['hw_photo_file_name']
                ];

                $this_data = array_merge((array)$node_data, (array)$specific_data);
                array_push($items, array('id'=> $node_id,'name'=> $node_name,'data' => $this_data));
                array_push($grey_list, array( 'nodeTo' => $i->id,'data' => array('$alpha'  => 0.0)));
            } else {
                $no_neighbors   = false; //Set this trigger for us to know once loop is done
                $adjacencies    = [];

                //=== Loop the neighbors ===
                foreach ($i->node_neighbors as $n) {
                
                   // print_r($n);
                
                
                    //We need to determine the 1.)Thickness 2.)Color and 3.) Opacity
                    $metric = $n->metric;
                    if($metric == 0){ //Ignore 0.0000's
                        continue;
                    }
                    $last   = strtotime($n->modified);
                    $now    = time();
                    $weight = round((1/$metric*$this->thickness), 2);


                    $green_cut  = $now - $dead_after;
                    $grey_cut   = $now - $cut_off;
                    
                    if ($last >= $green_cut) {
                        $c = $this->green;

                        //5G we make blue
                        if (($n->hwmode == '11a')||($n->hwmode == '11na')) {
                            $c = $this->dark_blue;
                        }

                        //How clear the line must be
                        $green_range    = $now - $green_cut;
                        $green_percent  = ($last- $green_cut)/$green_range;
                        $o_val          = ($green_percent * 0.5)+0.5;
                        $o_val          = round($o_val, 2);
                    } elseif (($last >= $grey_cut)&&($last <= $green_cut)) {
                        //How clear the line must be
                        $c              = $this->grey; //Default

                        //5G we make blue
                        if (($n->hwmode == '11a')||($n->hwmode == '11na')) {
                            $c = $this->blue_grey;
                        }

                        $grey_range     = $green_cut - $grey_cut;
                        $grey_percent   = ($last- $grey_cut)/$grey_range;
                        $o_val          = ($grey_percent * 0.5)+0.5;
                        $o_val          = round($o_val, 2);
                    } else {
                        $weight             = 0;
                        $o_val          = 0;
                        $c              = $this->grey; //Default
                    }
                    
                    //First check if neighbor_id is valid
                    $ent_v_n = $this->{'Nodes'}->find()->where(['Nodes.id' => $n->neighbor_id, 'Nodes.mesh_id' => $mesh_id])->first();
                    if($ent_v_n){
                        array_push($adjacencies, array(
                            'nodeTo'    => $n->neighbor_id,
                            'data'      => array(
                                '$color'    => $c,
                                '$lineWidth'=> $weight,
                                '$alpha'    => $o_val
                            )
                        ));
                    }
                    
                }
                //=== End loop neighbors ===

                $specific_data = [
                    ////'$color'        => $color,
                    ////'$type'             => "circle",
                    ////'$dim'          => $size,
                    ////'type'          => $type,
                    
                    '$type'     => "image",
                    '$url'      => "/cake4/rd_cake/img/hardwares/".$node_data['hw_photo_file_name']                     
                ];
                $this_data = array_merge((array)$node_data, (array)$specific_data);
                array_push($items, ['id'=> $this_data['id'],'name'=> $this_data['name'], 'data' => $this_data,'adjacencies'=> $adjacencies]);
                
            }
            
        }
        //End the loop of nodes

        if ($no_neighbors) {
            //Add a 'ghost' node as the center
            array_push($items, array(
                'id'    => 'center',
                'name'  => '',
                'data'  => array(
                    '$color'    => "grey",
                    '$type'         => "circle",
                    '$dim'      => 0
                ),
                'adjacencies'   => $grey_list
            ));
        } else {
            //Attach those to the list of adjacencies of the gateway node
            $count = 0;
            foreach ($items as $item) {
                //Attach to the first one
                //FIXME I DONT THINK THIS GETS CALLED
                if (isset($item['gateway'])&&($item['gateway']=='yes')) {
                    if (isset($item['adjacencies'])) {
                        $items[$count]['adjacencies'] = array_merge((array)$item['adjacencies'], (array)$grey_list);
                    } else {
                        $items[$count]['adjacencies'] = $grey_list;
                    }
                    break;
                }
                $count ++;
            }
        }

        $this->set([
            'data' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function overviewMeshes(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        } 
        $req_q    = $this->request->getQuery();
             
        $query  =  $this->Meshes->find();  
        if(isset($req_q['mesh_id'])){
            $mesh_id    = $req_q['mesh_id'];
            if($mesh_id !== ''){
                $query->where(['Meshes.id' => $mesh_id]);
            }
        }
       
		$cloud_id 	= $req_q['cloud_id'];
        
        $this->CommonQueryFlat->build_cloud_query($query,$cloud_id, ['Users','Nodes']); //AP QUERY is sort of different in a way     
        $q_r    = $query->all();
        
        $coordsAll  = [];
        $meshes     = [];

        foreach ($q_r as $i) {
            $coords  = [];
            foreach ($i->nodes as $node) {
                if ($node->lat != null) {   //Only those with co-ordinates
                    array_push($coords,     ['lat' =>$node->lat,'lng'=>$node->lon]);
                    array_push($coordsAll,  ['lat' =>$node->lat,'lng'=>$node->lon]);
                }
            }
            if (sizeof($coords) >0) {
                $center = $this->_get_center($coords);
                array_push($meshes, array(
                    'center'     => ["lat" => $center[0],"lng" => $center[1]] ,
                    'name'       => $i->name." (Devices:". sizeof($i->nodes).")",
                    'meshID'     => $i->id
                ));
            }
        }
        //FIXME Try and figure out whats broken
        //$center = $this->_get_center($coordsAll);
        $this->set([
            'meshes'   => $meshes,
            'center'   => [],
            'success'  => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function overviewGoogleMap()
    {

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        if (null == $this->request->getQuery('mesh_id')) {
            $this->set([
                'message'   => "Mesh ID (mesh_id) missing",
                'success' 	=> false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
            return;          
        }

        $items          = [];
        $connections    = [];

        //Create a hardware lookup for proper names of hardware
        $hardware = $this->_make_hardware_lookup();
       
        //Find all the nodes for this mesh
        $mesh_id = $this->request->getQuery('mesh_id');
       
        $q_r = null;

        if ($mesh_id != -1) {
            //$q_r = $this->Nodes->find()->contain(['NodeNeighbors', 'NodeStations'])->where(['Nodes.mesh_id' => $mesh_id])->all();                          
            $q_r = $this->Nodes->find()
                ->contain('NodeStations',function ($q) {
                    $back = (FrozenTime::now())->subHours(1);
                    return $q
                        ->group(['mac'])
                        ->where(['modified >=' => $back]);
                }) 
                 ->contain('NodeNeighbors',function ($q) {
                    $back= (FrozenTime::now())->subHours(1);
                    return $q
                        ->where(['modified >=' => $back]);
                        
                })               
                ->where(['Nodes.mesh_id' => $mesh_id])->all();
        } else {
            //$q_r = $this->Nodes->find()->contain(['NodeNeighbors', 'NodeStations'])->all();
            $q_r = $this->Nodes->find()->contain([])
                ->contain('NodeStations',function ($q) {
                    $back = (FrozenTime::now())->subHours(1);
                    return $q
                        ->group(['mac'])
                        ->where(['modified >=' => $back]);
                }) 
                 ->contain('NodeNeighbors',function ($q) {
                    $back= (FrozenTime::now())->subHours(1);
                    return $q
                        ->where(['modified >=' => $back]);
                        
                })
                ->all();
        }

        //Get the 'dead_after' value
        $dead_after = $this->_get_dead_after($mesh_id);

        //Build a hash of nodes with their detail for lookup
        $neighbor_hash = [];
    
        foreach ($q_r as $i) {
            if ($i->lat != null) {  //Only those with co-ordinates
                $id = $i->id;
                $neighbor_hash[$id]=$i;
            }
        }


        //Some defaults for the spiderweb
        $thickness  = 9;    //The bigger the metric; ther thinner this line
        $opacity    = 1;    //The older a line is the more opacity it will have (tend to zero)
        $cut_off    = 3 * $dead_after;
        $one_hour   = 3600000;

        foreach ($q_r as $i) {
            //print_r($i);
            $node_id    = $i->id;
            $node_name  = $i->name;
            $l_contact  = $i->last_contact;
            $hw_id      = $i->hardware;
           
            $hw_human   = $hardware["$hw_id"]['name'];  //Human name for Hardware
            $hw_photo   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware        

            $gw             = false;
            $connsLastHour  = 0;

            if (count($i->node_stations) > 0) {
                $now    = time();

                foreach ($i->node_stations as $n) {
                    $last   = strtotime($n->modified);

                    if ($last >= ($now - $one_hour)) {
                        $connsLastHour++;
                    }
                }
            }


            if (count($i->node_neighbors)>0) {
                $gw = $i->node_neighbors[0]['gateway'];

                foreach ($i->node_neighbors as $n) {
                    $n_id   = $n->neighbor_id;
                    $metric = $n->metric;
                    $last   = strtotime($n->modified);
                    $now    = time();

                    //It might be so old that we do not bother drawing it
                    if ($last <= ($now - $cut_off)) {
                        continue;
                    }

                    //print_r($n);
                    if ((array_key_exists($n_id, $neighbor_hash)) &&  (array_key_exists($node_id, $neighbor_hash))
                    ) {
                        $from_lat   = $neighbor_hash[$node_id]['lat'];
                        $from_lng   = $neighbor_hash[$node_id]['lon'];
                        $to_lat     = $neighbor_hash[$n_id]['lat'];
                        $to_lng     = $neighbor_hash[$n_id]['lon'];
                        $metric         = $n->metric;
                        $weight         = round((1/$metric*$this->thickness), 2);

                        //What color the line must be
                        $green_cut  = $now - $dead_after;
                        $grey_cut   = $now - $cut_off;
                        
                        if ($last >= $green_cut) {
                            $c = $this->green;
                            if (($n->hwmode == '11a')||($n->hwmode == '11na')) {
                                $c = $this->dark_blue;
                            }

                            //How clear the line must be
                            $green_range    = $now - $green_cut;
                            $green_percent  = ($last- $green_cut)/$green_range;
                            $o_val          = ($green_percent * 0.5)+0.5;
                            $o_val          = round($o_val, 2);
                        } else {
                            //How clear the line must be
                            $c              = $this->grey;
                            if (($n->hwmode == '11a')||($n->hwmode == '11na')) {
                                $c = $this->blue_grey;
                            }
                            $grey_range     = $green_cut - $grey_cut;
                            $grey_percent   = ($last- $grey_cut)/$grey_range;
                            $o_val          = ($grey_percent * 0.5)+0.5;
                            $o_val          = round($o_val, 2);
                        }

                        array_push($connections, array(
                            'from'  => array(
                                'lat'   => $from_lat,
                                'lng'   => $from_lng
                            ),
                            'to'    => array(
                                'lat'   => $to_lat,
                                'lng'   => $to_lng
                            ),
                            'weight'    => $weight,
                            'color'         => $c,
                            'opacity'   => $o_val,
                            'metric'    => $metric
                        ));
                    }
                }
            }

            //Find the dead time (only once)
            if ($l_contact == null) {
                $l_contact_human = null;
                $state = 'never';
            } else {
                $last_timestamp = strtotime($l_contact);
                $l_contact_human = $this->TimeCalculations->time_elapsed_string($l_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $state = 'down';
                } else {
                    $state = 'up';
                }
            }

            $i->l_contact_human = $l_contact_human;
            
            $i->state         = $state;
            $i->hw_human      = $hw_human;
            $i->hw_photo_file_name = $hw_photo;
            $i->lng           = $i->lon;
            $i->gateway       = $gw;
            $i->connections   =  $connsLastHour;

            array_push($items, $i);
        }

        $this->set([
            'items'         => $items,
            'connections'   => $connections,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function viewEntries(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        if (null == $this->request->getQuery('mesh_id')) {
            $this->set(array(
                'message'   => "Mesh ID (mesh_id) missing",
                'success' 	=> false
            ));
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }
        
        $vendor_file        = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);

        $items      = [];
        $id         = 1;
        $this->timespan   = $this->request->getQuery('timespan'); //hour, day or week
        $modified   = $this->_get_timespan();
        
        $req_q    	= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];
 
        //Find all the entries for this mesh
        $mesh_id    = $this->request->getQuery('mesh_id');

        $meshEntries = $this->MeshEntries->find()->where(['MeshEntries.mesh_id' => $mesh_id])->contain(['MeshEntrySchedules'])->all();

        //Create a lookup of all the nodes for this mesh
        $nodes = $this->Nodes->find()->where(['Nodes.mesh_id' => $mesh_id])->all();
        $this->node_lookup = [];
        foreach ($nodes as $n) {
            $n_id   = $n->id;
            $n_name = $n->name;
            $this->node_lookup[$n_id] = $n_name;
        }
    
        //Find all the distinct MACs for this Mesh entry...
        foreach ($meshEntries as $meshEntry) {
            $meshEntryId    = $meshEntry->id;
            $entryName      = $meshEntry->name;
            if(count($meshEntry->mesh_entry_schedules) > 0){
            	$entryName     = $meshEntry->name.' <i class="fa  fa-calendar" style="color:#1272c7"></i>';
            }

            $nodeStations = $this->NodeStations->find()
                ->select([
                    'mac_address_id',
                    'mac'   => 'MacAddresses.mac'
                ])
                ->distinct(['mac_address_id'])
                ->contain(['MacAddresses'])
                ->where([
                    'NodeStations.mesh_entry_id' => $meshEntryId,
                    'NodeStations.modified >='   => $modified
                ])->all();
           
            $nodeStationLookup = [];  
              
            foreach($nodeStations as $nodeStation){
                $mac_id = $nodeStation->mac_address_id;
                $nodeStationLookup[$mac_id] = $nodeStation->mac;
            }
            
            if($this->timespan !== 'hour'){
                 $nodeStationHourlies = $this->NodeStationHourlies->find()
                    ->select([
                        'mac_address_id',
                        'mac'   => 'MacAddresses.mac'
                    ])
                    ->distinct(['mac_address_id'])
                    ->contain(['MacAddresses'])
                    ->where([
                        'NodeStationHourlies.mesh_entry_id' => $meshEntryId,
                        'NodeStationHourlies.modified >='   => $modified
                    ])->all();
                foreach($nodeStationHourlies as $nodeStationHourly){
                    $mac_id = $nodeStationHourly->mac_address_id;
                    $nodeStationLookup[$mac_id] = $nodeStationHourly->mac;
                }                       
            }
            
            if (count($nodeStationLookup) > 0 ) {
                foreach ($nodeStationLookup as $mac_address_id => $mac) {
                
                    //==Get the sum of Bytes and avg of signal using the raw data== (for timespan == 'hour' )
                    $t_bytes = 0;
                    $r_bytes = 0;
                    $q_t = $this->NodeStations->find()
                        ->select($this->fields)
                        ->where([
                            'mac_address_id'=> $mac_address_id,
                            'mesh_entry_id' => $meshEntryId,
                            'modified >='   => $modified
                        ])
                        ->first();                 
                        
                    if($q_t->signal_avg){

                        $t_bytes    = $t_bytes + $q_t->tx_bytes;
                        $r_bytes    = $r_bytes + $q_t->rx_bytes;
                        $signal_avg = round($q_t->signal_avg);
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
                    }
                    
                    if($this->timespan !== 'hour'){
                        $q_t_h = $this->NodeStationHourlies->find()
                            ->select($this->fields)
                            ->where([
                                'mac_address_id'=> $mac_address_id,
                                'mesh_entry_id' => $meshEntryId,
                                'modified >='   => $modified
                            ])
                            ->first();
                            
                        if($q_t_h->signal_avg){
                        
                            $t_bytes    = $t_bytes + $q_t_h->tx_bytes;
                            $r_bytes    = $r_bytes + $q_t_h->rx_bytes;
                            //-- Here we use the older ones for average
                            $signal_avg = round($q_t_h->signal_avg);
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
                            
                        }                  
                    }
                    
                    $basic = [
                        'id'                => $id,
                        'name'              => $entryName,
                        'mesh_entry_id'     => $meshEntryId,
                        'mac'               => $mac,
                        'mac_address_id'    => $mac_address_id,
                        'vendor'            => $this->_lookup_vendor($mac),
                        'tx_bytes'          => $t_bytes,
                        'rx_bytes'          => $r_bytes,
                        'signal_avg'        => $signal_avg ,
                        'signal_avg_bar'    => $signal_avg_bar
                    ];  
                    
                    $latestInfo = $this->_getLatestEntryInfo($meshEntryId,$mesh_id,$mac_address_id);                                      
                    $basic      = (array_merge($basic,$latestInfo));                                                                         
                    $mActions   = $this->_getMacActions($cloud_id,$mesh_id,$mac_address_id);
                    $basic      = (array_merge($basic,$mActions));                               
                    array_push($items, $basic);
                    $id++;
                }
            } else {
                 array_push($items, array(
                        'id'                => $id,
                        'name'              => $entryName,
                        'mesh_entry_id'     => $meshEntryId,
                        'mac'               => 'N/A',
                        'tx_bytes'          => 0,
                        'rx_bytes'          => 0,
                        'signal_avg'        => null ,
                        'signal_bar'        => 'N/A' ,
                        'signal_avg_bar'    => 'N/A',
                        'signal_bar'        => 'N/A',
                        'signal'            => null,
                        'tx_bitrate'        => 0,
                        'rx_bitrate'        => 0,
                        'vendor'            => 'N/A'
                    ));
                    $id++;
            }
        }

        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }


    public function viewNodes()
    {

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        if (null == $this->request->getQuery('mesh_id')) {
            $this->set([
                'message'   => "Mesh ID (mesh_id) missing",
                'success' 	=> false
            ]);
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }

        $items      = [];
        $id         = 1;
        $modified   = $this->_get_timespan();
        $this->timespan   = $this->request->getQuery('timespan'); //hour, day or week
        
        $req_q    	= $this->request->getQuery();
        $cloud_id 	= $req_q['cloud_id'];
        
        $vendor_file       = APP."StaticData".DS."mac_lookup.txt";
        $this->vendor_list  = file($vendor_file);

        //Find all the nodes for this mesh
        $mesh_id = $this->request->getQuery('mesh_id');

        $nodes = $this->Nodes->find()->where(['Nodes.mesh_id' => $mesh_id])->all();

        //Get the 'dead_after' value
        $dead_after = $this->_get_dead_after($mesh_id);
       
        //Create a lookup of all the entries for this mesh
        $meshEntries = $this->MeshEntries->find()->where(['MeshEntries.mesh_id' => $mesh_id])->all();

        $this->entry_lookup = [];
        foreach ($meshEntries as $meshEntry) {
            $e_id   = $meshEntry->id;
            $e_name = $meshEntry->name;
            $this->entry_lookup[$e_id] = $e_name;
        }
       
        //Find all the distinct MACs for this Mesh node...
        foreach ($nodes as $node) {
            $node_id    = $node->id;
            $node_name  = $node->name;
            $l_contact  = $node->last_contact;

            if ($l_contact == null) {
                $l_contact_human = null;
                $state = 'never';
            } else {
                $l_contact_human = $this->TimeCalculations->time_elapsed_string($l_contact);
                
                $last_timestamp = strtotime($l_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $state = 'down';
                } else {
                    $state = 'up';
                }
            }

            $nodeStations = $this->NodeStations->find()
                ->select([
                    'mac_address_id',
                    'mac'   => 'MacAddresses.mac'
                ])
                ->distinct(['mac_address_id'])
                ->contain(['MacAddresses'])
                ->where([
                    'NodeStations.node_id'       => $node_id,
                    'NodeStations.modified >='   => $modified
                ])
                ->all();
                
            $nodeStationLookup = [];  
              
            foreach($nodeStations as $nodeStation){
                $mac_id = $nodeStation->mac_address_id;
                $nodeStationLookup[$mac_id] = $nodeStation->mac;
            }
            
            if($this->timespan !== 'hour'){
                 $nodeStationHourlies = $this->NodeStationHourlies->find()
                    ->select([
                        'mac_address_id',
                        'mac'   => 'MacAddresses.mac'
                    ])
                    ->distinct(['mac_address_id'])
                    ->contain(['MacAddresses'])
                    ->where([
                        'NodeStationHourlies.node_id'       => $node_id,
                        'NodeStationHourlies.modified >='   => $modified
                    ])
                    ->all();
                foreach($nodeStationHourlies as $nodeStationHourly){
                    $mac_id = $nodeStationHourly->mac_address_id;
                    $nodeStationLookup[$mac_id] = $nodeStationHourly->mac;
                }                       
            }
            
            if (count($nodeStationLookup) > 0 ) {
                foreach ($nodeStationLookup as $mac_address_id => $mac) {
                
                    //==Get the sum of Bytes and avg of signal using the raw data== (for timespan == 'hour' )
                    $t_bytes = 0;
                    $r_bytes = 0;     

                    //Get the sum of Bytes and avg of signal
                    $q_t = $this->NodeStations->find()
                        ->select($this->fields)
                        ->where([
                            'mac_address_id'   => $mac_address_id,
                            'node_id'          => $node_id,
                            'modified >='      => $modified
                        ])
                        ->first();

                    if($q_t->signal_avg){
                        $t_bytes    = $t_bytes + $q_t->tx_bytes;
                        $r_bytes    = $r_bytes + $q_t->rx_bytes;
                        $signal_avg = round($q_t->signal_avg);
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
                    }
                    
                    if($this->timespan !== 'hour'){
                        $q_t_h = $this->NodeStationHourlies->find()
                            ->select($this->fields)
                            ->where([
                                'mac_address_id'   => $mac_address_id,
                                'node_id'          => $node_id,
                                'modified >='      => $modified
                            ])
                            ->first();
                        if($q_t_h->signal_avg){
                            $t_bytes    = $t_bytes + $q_t_h->tx_bytes;
                            $r_bytes    = $r_bytes + $q_t_h->rx_bytes;
                            //-- Here we use the older ones for average
                            $signal_avg = round($q_t_h->signal_avg);
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
                        }               
                    }                      
                                
                    $basic = [
                        'id'                => $id,
                        'name'              => $node_name,
                        'node_id'           => $node_id,
                        'mac'               => $mac,
                        'mac_address_id'    => $mac_address_id,
                        'vendor'            => $this->_lookup_vendor($mac),
                        'tx_bytes'          => $t_bytes,
                        'rx_bytes'          => $r_bytes,
                        'signal_avg'        => $signal_avg ,
                        'signal_avg_bar'    => $signal_avg_bar,
                        'state'             => $state,
                        'l_contact'         => $l_contact,
                        'l_contact_human'   => $l_contact_human,                      
                    ];
                    
                    $latestInfo = $this->_getLatsetNodeInfo($node_id,$mesh_id,$mac_address_id,$dead_after);                                   
                    $basic      = (array_merge($basic,$latestInfo));                  
                    
                    $mActions   = $this->_getMacActions($cloud_id,$mesh_id,$mac_address_id);
                    $basic      = (array_merge($basic,$mActions));                    
                    array_push($items, $basic);                                        
                    $id++;
                }
            } else {
                 array_push($items, array(
                        'id'                => $id,
                        'name'              => $node_name,
                        'mesh_entry_id'     => $node_id,
                        'mac'               => 'N/A',
                        'tx_bytes'          => 0,
                        'rx_bytes'          => 0,
                        'signal_avg'        => null ,
                        'signal_bar'        => 'N/A' ,
                        'signal_avg_bar'    => 'N/A',
                        'signal_bar'        => 'N/A',
                        'signal'            => null,
                        'tx_bitrate'        => 0,
                        'rx_bitrate'        => 0,
                        'vendor'            => 'N/A',
                        'l_contact'         => $l_contact,
                        'l_contact_human'   => $l_contact_human,
                        'state'             => $state
                    ));
                    $id++;
            }
        }

        $this->set(array(
          'items' => $items,
          'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function viewNodeNodes(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        if (null == $this->request->getQuery('mesh_id')) {
            $this->set(array(
                'message'   => "Mesh ID (mesh_id) missing",
                'success' 	=> false,
            ));
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }

        $items          = array();
        $id             = 1;
        $modified       = $this->_get_timespan();

        //Find all the nodes for this mesh
        $mesh_id        = $this->request->getQuery('mesh_id');
        $q_r            = $this->Nodes->find()->where(['Nodes.mesh_id' => $mesh_id])->all();
        //Get the 'dead_after' value
        $dead_after     = $this->_get_dead_after($mesh_id);               
        //Find all the distinct MACs for this Mesh node...
        foreach ($q_r as $i) {
            $node_id    = $i->id;
            $node_name  = $i->name;
            $l_contact  = $i->last_contact;

            //Find the dead time (only once)
            if ($l_contact == null) {
                $l_contact_human = null;
                $state = 'never';
            } else {
                $l_contact_human = $this->TimeCalculations->time_elapsed_string($l_contact);

                $last_timestamp = strtotime($l_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $state = 'down';
                } else {
                    $state = 'up';
                }
            }

            //--Get a list of all the other nodes to which this one connected within specified time
            $q_s = $this->NodeIbssConnections->find()->select(['mac'])->distinct(['mac'])->where([
                'NodeIbssConnections.node_id'    => $node_id,
                'NodeIbssConnections.modified >='    => $modified
            ])->all();

            //----- Found ANY? --------------

            if ($q_s) {
                foreach ($q_s as $j) {
                    $mac = $j->mac;
                    //Get the sum of Bytes and avg of signal
                    $q_t = $this->NodeIbssConnections->find()->select([
                        'tx_bytes' => 'SUM(NodeIbssConnections.tx_bytes)',
                        'rx_bytes' => 'SUM(NodeIbssConnections.rx_bytes)',
                        'signal_avg' => 'AVG(NodeIbssConnections.signal_avg)',
                    ])->where([
                        'NodeIbssConnections.mac'           => $mac,
                        'NodeIbssConnections.node_id'       => $node_id,
                        'NodeIbssConnections.modified >='   => $modified
                    ])->first();

                    $t_bytes    = $q_t->tx_bytes;
                    $r_bytes    = $q_t->rx_bytes;
                    $signal_avg = round($q_t->signal_avg);
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

                    //Get the latest entry
                    $lastCreated = $this->NodeIbssConnections->find()->where([
                        'NodeIbssConnections.mac'       => $mac,
                        'NodeIbssConnections.node_id'   => $node_id
                    ])->order(['NodeIbssConnections.created' => 'desc'])->first();


                    $signal = $lastCreated->signal_now;

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
                    
                    //-- FIND THE PEER ---
                    //The peer should contain the mesh interface's MAC address as one of the stations
                    $if_mac = $lastCreated->if_mac;
                    
                    $ent_peer = $this->NodeIbssConnections->find()->where([
                        'NodeIbssConnections.mac'       => $if_mac,
                        'NodeIbssConnections.if_mac'    => $mac
                    ])->order(['NodeIbssConnections.created' => 'desc'])->first();                         
                    
                    //Try and find the name of the peer node
                    //$peer_name =  $this->_find_peer_name($mac);
                    $peer_name      = "(not known)";
                    $p_last_seen    = "(not known)";
                    $peer_state     = "(not known)";
                    $peer_l_contact_human = "(not known)";
                    
                    if($ent_peer){                  
                        $q_n = $this->Nodes->find()->where(['Nodes.id' => $ent_peer->node_id])->first();
                        if ($q_n){
                            $peer_name  = $q_n->name;
                            $mac        = $q_n->mac;
                            $p_last_seen= $q_n->last_contact;
                            $p_last_timestamp = strtotime($p_last_seen);
                            if ($p_last_timestamp+$dead_after <= time()) {
                                $peer_state = 'down';
                            } else {
                                $peer_state = 'up';
                            } 
                        }      
                    }
                    //-- END PEER DETAIL --
                                       
                    if($p_last_seen !== "(not known)"){
                        $peer_l_contact_human = $this->TimeCalculations->time_elapsed_string($p_last_seen);
                    }   
                   
                    array_push($items, array(
                        'id'                => $id,
                        'name'              => $node_name,
                        'node_id'           => $node_id,
                        'mac'               => $mac,
                        'peer_name'         => $peer_name,
                        'peer_last_contact' => $p_last_seen,
                        'peer_l_contact_human' => $peer_l_contact_human,
                        'peer_state'        => $peer_state,
                        'tx_bytes'          => $t_bytes,
                        'rx_bytes'          => $r_bytes,
                        'signal_avg'        => $signal_avg ,
                        'signal_avg_bar'    => $signal_avg_bar,
                        'signal_bar'        => $signal_bar,
                        'signal'            => $signal,
                        'l_tx_bitrate'      => $lastCreated->tx_bitrate,
                        'l_rx_bitrate'      => $lastCreated->rx_bitrate,
                        'l_signal'          => $lastCreated->signal_now,
                        'l_signal_avg'      => $lastCreated->signal_avg,
                        'l_MFP'             => $lastCreated->MFP,
                        'l_tx_failed'       => $lastCreated->tx_failed,
                        'l_tx_retries'      => $lastCreated->tx_retries,
                        'l_modified'        => $lastCreated->modified,
                        'l_modified_human'  => $this->TimeCalculations->time_elapsed_string($lastCreated->modified),
                        'l_authenticated'   => $lastCreated->authenticated,
                        'l_authorized'      => $lastCreated->authorized,
                        'l_tx_bytes'        => $lastCreated->tx_bytes,
                        'l_rx_bytes'        => $lastCreated->rx_bytes,
                        'l_contact'         => $l_contact,
                        'l_contact_human'   => $l_contact_human,
                        'state'             => $state
                    ));
                    $id++;
                }
            } else {  //---NOT FOUND ANY???----

                 array_push($items, array(
                        'id'                => $id,
                        'name'              => $node_name,
                        'node_id'           => $node_id,
                        'mac'               => 'N/A',
                        'tx_bytes'          => 0,
                        'rx_bytes'          => 0,
                        'signal_avg'        => null ,
                        'signal_bar'        => 'N/A' ,
                        'signal_avg_bar'    => 'N/A',
                        'signal_bar'        => 'N/A',
                        'signal'            => null,
                        'tx_bitrate'        => 0,
                        'rx_bitrate'        => 0,
                        'vendor'            => 'N/A',
                        'l_contact'         => $l_contact,
                        'l_contact_human'   => $l_contact_human,
                        'state'             => $state
                    ));
                    $id++;
            }

            //--- END FOUND ANY?---
        }

        $this->set(array(
          'items' => $items,
          'success' => true
        ));
        $this->viewBuilder()->setOption('serialize', true);
    }


    public function viewNodeDetails(){
    
        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        if (null == $this->request->getQuery('mesh_id')) {
            $this->set(array(
                'message'   => "Mesh ID (mesh_id) missing",
                'success' => false,
            ));
            $this->viewBuilder()->setOption('serialize', true);
            return;
        }

        $items      = [];
        $mesh_id    = $this->request->getQuery('mesh_id');
        
        $do_gateway = true;

        //Get the 'dead_after' value
        $dead_after = $this->_get_dead_after($mesh_id);

        $q_r = $this->Nodes->find()
            ->contain([
                'NodeSystems', 'NodeLoads', 
                'NodeActions' => ['sort' => ['NodeActions.id' => 'DESC']], 
                'NodeNeighbors',
                'NodeUptmHistories',
                'NodeConnectionSettings'
            ])->where(['Nodes.mesh_id' => $mesh_id])->all();

        //Create a hardware lookup for proper names of hardware
        $hardware   = $this->_make_hardware_lookup();

        foreach ($q_r as $i) {
            $l_contact  = $i->last_contact;
            $hw_id      = $i->hardware;
            $config_fetched = $i->config_fetched;
            
            if (array_key_exists($hw_id,$hardware)){
                $i->hw_human   = $hardware["$hw_id"]['name'];  //Human name for Hardware
                $i->hw_photo   = $hardware["$hw_id"]['photo_file_name'];  //Human name for Hardware
            }

            //===Determine when last did we saw this node (never / up / down) ====
            if ($l_contact == null) {
                $state = 'never';
                $i->last_contact_human = $l_contact;
            } else {
                $last_timestamp = strtotime($l_contact);
                if ($last_timestamp+$dead_after <= time()) {
                    $state = 'down';
                } else {
                    $state = 'up';
                }
                
                //Make it easy for us to understand
                $i->last_contact_human = $this->TimeCalculations->time_elapsed_string($l_contact);
            }

            if($config_fetched == null){
                $config_state                       = 'never';
                $i->config_fetched_human  = $config_fetched;
            }else{
                $last_config = strtotime($config_fetched);
                if ($last_config+$dead_after <= time()) {
                    $config_state = 'down';
                } else {
                    $config_state = 'up';
                }
            
                $i->config_fetched_human = $this->TimeCalculations->time_elapsed_string($config_fetched);
            }
            
            //wbw detail
            if($i->node_connection_settings){   
                $i->{'wbw_active'} = false;
                $i->{'qmi_active'} = false;
                foreach($i->node_connection_settings as $ncs){
                	//-wbw-
                    if($ncs->grouping == 'wbw_info'){                    
                        if($ncs->name == 'signal'){
                            $i->wbw_last_contact_human     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                        }
                        $wbw_name = 'wbw_'.$ncs->name;
                        $i->{$wbw_name} = $ncs->value;
                    }
                    if($ncs->grouping == 'wbw_setting'){
                        $i->{'wbw_active'} = true;
                    }
                    
                    //-qmi-signal
                    if($ncs->grouping == 'qmi_info_signal'){                    
                    	if($ncs->name == 'type'){
                            $i->qmi_last_contact_human     = $this->TimeCalculations->time_elapsed_string($ncs->modified);
                        }                    
                    	$qmi_name = 'qmi_'.$ncs->name;
                        $i->{$qmi_name} = $ncs->value;                    
                    }
                    if($ncs->grouping == 'qmi_setting'){
                        $i->{'qmi_active'} = true;
                    }
                    
                    //-qmi-system
                    if($ncs->grouping == 'qmi_info_system'){ 
                    	//We only care for mcc and mnc for now                   
                    	if(str_contains($ncs->name ,':mcc')){
                    		$qmi_name = 'qmi_mcc';
                    		$i->{$qmi_name} = $ncs->value;
                    	}  
                    	if(str_contains($ncs->name ,':mnc')){
                    		$qmi_name = 'qmi_mnc';
                    		$i->{$qmi_name} = $ncs->value;
                    	}                                      
                    }            
                }
                
                //--We got all our values - now we can do some more processing
                //-- WBW things --
                if($i->{'wbw_signal'}){       
                    if ($i->{'wbw_signal'} < -95) {
                        $signal_bar = 0.01;
                    }
                    if (($i->{'wbw_signal'} >= -95)&($i->{'wbw_signal'} <= -35)) {
                            $p_val = 95-(abs($i->{'wbw_signal'}));
                            $signal_bar = round($p_val/60, 1);
                    }
                    if ($i->{'wbw_signal'} > -35) {
                        $signal_bar = 1;
                    }
                    $i->{'wbw_signal_bar'} = $signal_bar;
                    
                    $i->{'wbw_tx_rate'} = round($i->{'wbw_tx_rate'}/1000 ,1);
                	$i->{'wbw_rx_rate'} = round($i->{'wbw_rx_rate'}/1000 ,1); 
                	$i->{'wbw_expected_throughput'} = round($i->{'wbw_expected_throughput'}/1000 ,1);    
                                        
                } 
                
                //-- LTE things --
                if($i->{'qmi_rssi'}){ 
		            $this->LteHelper->getMobileProvider($i); 
		            $this->LteHelper->getRssiGui($i);
		            $this->LteHelper->getRsrpGui($i);
		            $this->LteHelper->getRsrqGui($i);
		            $this->LteHelper->getSnrGui($i);
		      	}
		      	               
            }
            
            unset($i->node_connection_settings); //Remove the list (not needed)
            
            
            $i->config_state = $config_state;

            //=== add extra info to node data ===
            $i->state     = $state;

            //$node_data = [];

            $node_data = $i->toArray();

            unset($node_data['node_loads'][0]['id']);      //Else the node's ID is just wrong!

            $load_data             = array_pop($node_data['node_loads']);

            $this_data              = array_merge((array)$node_data, (array)$load_data);

            $system_data            = [];
            foreach ($node_data['node_systems'] as $ns) {

                $group  = $ns['category'];
                $name   = $ns['name'];
                $value  = $ns['value'];
                $k      = ['name' => $name, 'value' => $value];

                if (!array_key_exists($group, $system_data)) {
                    $system_data[$group] = [];
                }
                array_push($system_data[$group], $k);
            }

            $this_data  = array_merge((array)$this_data, (array)$system_data);
            
            //Merge the last command (if present)
            if(count($i->node_actions) > 0){
                $last_action = $i->node_actions[0];
                //Add it to the list....
                if(isset($last_action['command'])){
                
                    if($last_action['command'] == '/etc/MESHdesk/rogue_scan.lua'){
                        $this_data['last_cmd'] = "Rogue AP Detection";
                    }else{    
                        $this_data['last_cmd'] = $last_action['command'];
                    }
                }
                if(isset($last_action['status'])){
                    $this_data['last_cmd_status'] = $last_action['status'];
                }
            }

/*
            $gateway = 'yes';
            if (count($i->node_neighbors) > 0) {
                $gateway = $i->node_neighbors[0]['gateway'];
            }
            $this_data['gateway'] = $gateway;
*/
            $gateway = 'no';
            if(($i->gateway == 'lan')||($i->gateway == '3g')||($i->gateway == 'wifi')){           
                $gateway = 'yes';      
            }
            $i->gateway = $gateway;
            
            $this_data['gateway'] = $gateway; 

            if ($gateway == 'yes') {
            
                //We only need to collect LAN infor for the gateway
                $this_data['lan_proto'] = $i->lan_proto;
                $this_data['lan_ip']    = $i->lan_ip;
                $this_data['lan_gw']    = $i->lan_gw;
            
            
                //See if there are any Openvpn connections
                $q_vpn = $this->OpenvpnServerClients->find()->contain(['OpenvpnServers'])->where(['OpenvpnServerClients.mesh_id' => $mesh_id])->all();

                if ($q_vpn) {
                    if ($do_gateway == true) { //This will ensure we only to it once per mesh :-)
                        $this_data['openvpn_list'] = [];
                        foreach ($q_vpn as $vpn) {
                            $vpn_name           = $vpn->openvpn_server->name;
                            $vpn_description    = $vpn->openvpn_server->description;
                            $last_contact_to_server  = $vpn->last_contact_to_server;
                            if ($last_contact_to_server != null) {
                                $lc_human           = $this->TimeCalculations->time_elapsed_string($last_contact_to_server);
                            } else {
                                $lc_human = 'never';
                            }
                            $vpn_state              = $vpn->state;
                            array_push($this_data['openvpn_list'], array(
                                'name'          => $vpn_name,
                                'description'   => $vpn_description,
                                'lc_human'      => $lc_human,
                                'state'         => $vpn_state
                            ));
                        }
                        //print_r($q_vpn);
                        $do_gateway = false;
                    }
                }
            }
            
            // Uptime Visualization
			$this_data['uptimhist'] = $node_data['node_uptm_histories'];
			$hist_pct = [];
			$hist_day = [];

			// Replace with get now() in real data scenario
			//$current_time = strtotime( '01/17/2018 09:30:00' );
			$current_time = time();
			// Subtract 24 hours
			$twentyfour_time = $current_time - (1440*60);
			$node_up_mins = 0;
			$node_dwn_mins = 0;
			$subtract_bar = false;
			$bar_start = true;
			if ( count($node_data['node_uptm_histories']) > 0 ) {
				$nuh_cnt = count($node_data['node_uptm_histories']);
				for ( $nuh = 0; $nuh < $nuh_cnt; $nuh++ ) {
					$node_state =  $node_data['node_uptm_histories'][$nuh]['node_state'];
					$rpt_date = strtotime($node_data['node_uptm_histories'][$nuh]['report_datetime']);
					$state_date = strtotime($node_data['node_uptm_histories'][$nuh]['state_datetime']);
					if ($nuh == 0) { // First one
						$diff =  ($rpt_date - $twentyfour_time)/60;
					}
					if ( ($nuh != 0) && ($nuh == ($nuh_cnt - 1)) ) { // last One
						$diff = ($current_time - $state_date)/60;
					} 
					if ( ($nuh > 0) && ( $nuh < ($nuh_cnt - 1) ) ){ // middle times
						$diff = ($rpt_date - $state_date)/60;
					}
					// Add up totals for pie
					if ( $node_state == 1) {
						$node_up_mins = $node_up_mins + $diff;
					} else {
						$node_dwn_mins = $node_dwn_mins + $diff;
					}
					// Figure how many 'bars' for diff
					$diff_rem = ((int) $diff) % 10; // Minimum bar is 20 minutes
					$diff_slice = $diff / 10;
					//printf('$node_state: %d, $diff: %f</br>', $node_state,$diff);
					if ( $diff_rem >= 5 ) {
						$bar_cnt = round($diff_slice, 0, PHP_ROUND_HALF_UP);
					} else {
						$bar_cnt = round($diff_slice, 0, PHP_ROUND_HALF_DOWN);
					}
					if ($subtract_bar == true) {
						$bar_cnt = $bar_cnt - 1;
						$subtract_bar = false;
					}
					if ( $bar_cnt == 0 ) {
						$bar_cnt = 1;
						$subtract_bar = true;
					}
					//array_push($hist_day,$diff);
					if ($bar_start == true) {
						array_push($hist_day,0);
						$bar_start = false;
					}
					for ( $dh = 0; $dh < $bar_cnt; $dh++ ) {
						if ( $node_state == 0) {
							array_push($hist_day,-10);
						} else {
							array_push($hist_day,10);
						}
					}

				}
				array_push($hist_day,0);
				array_push($hist_pct, $node_up_mins);
				array_push($hist_pct, $node_dwn_mins);
			} else {
				if ( $config_state == 'up' ) {
					array_push($hist_pct,1440);
					array_push($hist_pct,0);
				} else {
					array_push($hist_pct,0);
					array_push($hist_pct,1440);
				}
				$bar_cnt = 142;
				array_push($hist_day,0);
				for ($dh = 0; $dh < $bar_cnt; $dh++) {
					if ( $config_state == 'up' ) {
						array_push($hist_day,10);
					} else {
						array_push($hist_day,-10);
					}
				}
				array_push($hist_day,0);
			}
			$this_data['dayuptimehist'] = $hist_day;
			$this_data['uptimhistpct'] = $hist_pct;

            array_push($items, $this_data);
        }

        $this->set([
            'items' => $items,
            'success' => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    public function restartNodes(){

        $user = $this->Aa->user_for_token($this);
        if (!$user) {   //If not a valid user
            return;
        }

        // Load Config
        Configure::load('MESHdesk');
        $cfg = Configure::read('mqtt_settings');

        $client = new Client();

        //Loop through the nodes and make sure there is not already one pending before adding one
        foreach ($this->request->getData('nodes') as $n) {
            $node_id    = $n['id'];
            $ent_node = $this->{'Nodes'}->find()->where(['Nodes.id' => $node_id])->first();        
            if($ent_node){  
                $ent_node->reboot_flag = !$ent_node->reboot_flag;
                if($this->{'Nodes'}->save($ent_node)){
                    if ($cfg['enable_realtime']){
                        //Talk to MQTT Broker
                        $data = $this->_get_node_mac_mesh_id($node_id);

                        $payload = [
                            'node_id' => $node_id,
                            'mac'  => strtoupper($data['mac']),
                            'mesh_id' => strtoupper($data['ssid']),
                            'cmd_id' => $nodeActionEntity->id,
                            'cmd' => 'reboot',
                        ];

                        if($this->_check_server($client, $cfg['api_gateway_url'], 5)){
                            $client->request('POST', $cfg['api_gateway_url'] . '/mesh/node/command', ['form_params' => ['message' => json_encode($payload)]]);
                        }
                    }
                }
            }
        }

        $items = [];
        $this->set([
            'items'         => $items,
            'success'       => true
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }

    //---------- Private Functions -------------- 

    private function _lookup_vendor($mac){
        //Convert the MAC to be in the same format as the file
        $mac    = strtoupper($mac);
        $pieces = explode(":", $mac);

        $big_match      = $pieces[0].":".$pieces[1].":".$pieces[2].":".$pieces[3].":".$pieces[4];
        $small_match    = $pieces[0].":".$pieces[1].":".$pieces[2];
        $lines          = $this->vendor_list;

        $big_match_found = false;
        foreach ($lines as $i) {
            if (preg_match("/^$big_match/", $i)) {
                $big_match_found = true;
                //Transform this line
                $vendor = preg_replace("/$big_match\s?/", "", $i);
                $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                $vendor = rtrim($vendor);
                return $vendor;
            }
        }
       
        if (!$big_match_found) {
            foreach ($lines as $i) {
                if (preg_match("/^$small_match/", $i)) {
                    //Transform this line
                    $vendor = preg_replace("/$small_match\s?/", "", $i);
                    $vendor = preg_replace( "{[ \t]+}", ' ', $vendor );
                    $vendor = rtrim($vendor);
                    return $vendor;
                }
            }
        }
        $vendor = "Unkown";
    }

    private function _get_dead_after($mesh_id){
        $data  = $this->_getDefaultSettings(); 
        if($data['report_adv_enable']==true){
            $dead_after = $data['report_adv_full'];
        }else{ 
            $dead_after = $data['heartbeat_dead_after'];
        }

        $n_s = $this->NodeSettings->find()->where(['NodeSettings.mesh_id' => $mesh_id])->first();

        if ($n_s) {
            if($n_s->report_adv_enable == true){
                $dead_after = $n_s->report_adv_full;
            }else{
                $dead_after = $n_s->heartbeat_dead_after;
            }
        }
        return $dead_after;
    }
    
    private function _getDefaultSettings(){   
        Configure::load('MESHdesk'); 
        $data  = Configure::read('common_node_settings'); //Read the defaults
        $this->loadModel('UserSettings');   
        $q_r = $this->{'UserSettings'}->find()->where(['user_id' => -1])->all();
        if($q_r){
            foreach($q_r as $s){
                //ALL Captive Portal Related default settings will be 'cp_<whatever>'
                if(preg_match('/^cp_/',$s->name)){
                    $name           = preg_replace('/^cp_/', '', $s->name);
                    $data[$name]    = $s->value;     
                }
                if($s->name == 'password'){
                    $data[]         = $s->value;
                    $data['password_hash']  = $this->_make_linux_password($s->value);   
                }
                
                if($s->name == 'country'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'heartbeat_dead_after'){
                    $data[$s->name]  = $s->value;
                } 
                if($s->name == 'timezone'){
                    $data[$s->name]  = $s->value;
                    $ent_tz = $this->{'Timezones'}->find()->where(['Timezones.id' => $s->value])->first();
                    if($ent_tz){
                        $data['tz_name'] = $ent_tz->name;
                        $data['tz_value']= $ent_tz->value;
                    }
                } 
            }
        }
        return $data;
    }
        
    private function _make_linux_password($pwd){
		return exec("openssl passwd -1 $pwd");
	}

    private function _make_hardware_lookup(){
        $hardware = [];
        
        $q_e = $this->{'Hardwares'}->find()->where(['Hardwares.for_mesh' => true])->all();
        
        foreach($q_e as $e){ 
            $id     = $e->fw_id;
            $name   = $e->name;
            $hardware["$id"] = ['name'=>$name,'photo_file_name' =>$e->photo_file_name];  
        }
        return $hardware;
    }


    function _get_center($coords){
        $count_coords = count($coords);
        $xcos=0.0;
        $ycos=0.0;
        $zsin=0.0;
        
        foreach ($coords as $lnglat) {
            $lat = $lnglat['lat'] * pi() / 180;
            $lon = $lnglat['lng'] * pi() / 180;
                
            $acos = cos($lat) * cos($lon);
            $bcos = cos($lat) * sin($lon);
            $csin = sin($lat);
            $xcos += $acos;
            $ycos += $bcos;
            $zsin += $csin;
        }
        
        $xcos /= $count_coords;
        $ycos /= $count_coords;
        $zsin /= $count_coords;
        $lon = atan2($ycos, $xcos);
        $sqrt = sqrt($xcos * $xcos + $ycos * $ycos);
        $lat = atan2($zsin, $sqrt);
        
        return array($lat * 180 / pi(), $lon * 180 / pi());
    }

    private function _get_timespan(){

        $hour   = (60*60);
        $day    = $hour*24;
        $week   = $day*7;
        $month  = $day*30;

        $timespan = 'hour';  //Default
        $cquery = $this->request->getQuery();
        if (isset($cquery['timespan'])) {
            $timespan = $cquery['timespan'];
        }

        if ($timespan == 'hour') {
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$hour);
        }

        if ($timespan == 'day') {
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$day);
        }

        if ($timespan == 'week') {
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$week);
        }
        if ($timespan == 'month') {
            //Get entries created modified during the past hour
            $modified = date("Y-m-d H:i:s", time()-$month);
        }
        
        return $modified;
    }
    
    private function _find_peer_name($mac){ 
        $mac = strtoupper($mac);
        $mac = str_replace(":","-",$mac);
        $mac = preg_replace('/^([a-fA-F0-9]{2})-/', "-", $mac); 

        $qr = $this->Nodes->find()->where(["Nodes.mac LIKE" => "%$mac",])->first();

        if($qr){
            return($qr->name);
        }else{
            return "(Unknown)";
        }
    }

    private function _get_node_mac_mesh_id($node_id){
        $q_r = $this->Nodes->find()->contain(['Meshes'])->where(['Nodes.id' => $node_id])->first();

        if($q_r){
            return [
                'mac' => $q_r->mac,
                'ssid' => strtoupper(str_replace('_','-',$q_r->ssid))
            ];
        }
        return [
            'mac' => '',
            'ssid' => ''
        ];
    }

    private function _check_server($client, $url, $timeout = 30){

        try {
            $client->request('GET', $url, ['timeout' => $timeout]);
            return true;

        } catch (\Exception $e) {
            // Fail silently
            return false;
        }
    }
    
    private function _find_alias($mac_address_id){    
    	$req_q    = $this->request->getQuery();    
       	$cloud_id = $req_q['cloud_id'];      
        $alias = false;
        $qr = $this->{'MacAliases'}->find()->where(['MacAliases.mac_address_id' => $mac_address_id,'MacAliases.cloud_id'=> $cloud_id])->first();
        if($qr){
        	$alias = $qr->alias;
        } 
        return $alias;
    }
      
    private function _findMacAddressId($mac){ 
        $macAddress = $this->MacAddresses->find()->where(['MacAddresses.mac' => $mac])->first();
        if($macAddress){
            return $macAddress->id;
        }    
    }
    
    //===============================
    //---- ACTIONS RELATED  --------
    //===============================
    
    private function _getMacActions($cloud_id, $mesh_id, $mac_id){
        $mActions = [
            'block_flag' => false,
            'limit_flag' => false,
            'firewall_flag' => false,
            'cloud_flag' => false,
            'bw_up' => '',
            'bw_down' => '',
            'fw_profile' => '',
            'alias' => $this->_find_alias($mac_id)
        ];

        $cloudAction = $this->_getCloudAction($cloud_id, $mac_id);
        if ($cloudAction) {
            $this->_applyCloudAction($mActions, $cloudAction);
        }

        $meshAction = $this->_getMeshAction($mesh_id, $mac_id);
        if ($meshAction) {
            $this->_applyMeshAction($mActions, $meshAction);
        }

        return $mActions;
    }

    private function _getCloudAction($cloud_id, $mac_id){

        return $this->{'MacActions'}->find()
            ->where(['MacActions.mac_address_id' => $mac_id, 'MacActions.cloud_id' => $cloud_id])
            ->contain(['FirewallProfiles'])
            ->first();
    }

    private function _getMeshAction($mesh_id, $mac_id){

        return $this->{'MacActions'}->find()
            ->where(['MacActions.mac_address_id' => $mac_id, 'MacActions.mesh_id' => $mesh_id])
            ->contain(['FirewallProfiles'])
            ->first();
    }

    private function _applyCloudAction(&$mActions, $action){

        $mActions['cloud_flag'] = true;
        switch ($action->action) {
            case 'block':
                $mActions['block_flag'] = true;
                break;
            case 'limit':
                $this->_applyLimitAction($mActions, $action);
                break;
            case 'firewall':
                $mActions['firewall_flag'] = true;
                $mActions['fw_profile'] = $action->firewall_profile->name;
                break;
        }
    }

    private function _applyMeshAction(&$mActions, $action){
    
        $mActions['cloud_flag'] = false;
        switch ($action->action) {
            case 'block':
                $mActions['block_flag'] = true;
                break;
            case 'limit':
                $this->_applyLimitAction($mActions, $action);
                break;
            case 'firewall':
                $mActions['firewall_flag'] = true;
                $mActions['fw_profile'] = $action->firewall_profile->name;
                break;
        }
    }

    private function _applyLimitAction(&$mActions, $action){

        $mActions['limit_flag'] = true;
        $mActions['bw_up'] = $this->_formatBandwidth($action->bw_up);
        $mActions['bw_down'] = $this->_formatBandwidth($action->bw_down);
    }

    private function _formatBandwidth($bandwidth){

        $bandwidth *= 8;
        $suffix = 'kbps';
        if ($bandwidth >= 1000) {
            $bandwidth /= 1000;
            $suffix = 'mbps';
        }
        return $bandwidth . ' ' . $suffix;
    }
    //---- END ACTIONS RELATED ----
    
    private function _getLatestEntryInfo($meshEntryId,$mesh_id,$macAddressId){
 
        //Get the latest entry
        $lastCreated = $this->NodeStations->find()->where([
                'mac_address_id'   => $macAddressId,
                'mesh_entry_id'    => $meshEntryId
            ])->order(['created'   => 'desc'])->first();
        $historical = false;          
        if(!$lastCreated){
            $historical = true;
            $lastCreated = $this->NodeStationHourlies->find()->where([
                'mac_address_id'   => $macAddressId,
                'mesh_entry_id'    => $meshEntryId
            ])->order(['created'   => 'desc'])->first();       
        }
        
        if($historical){
            $signal = $lastCreated->signal_avg;
        }else{
            $signal = $lastCreated->signal_now;
        }      

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

        $last_node_id = $lastCreated->node_id;

        //Find the dead time (only once)
        $l_contact = $lastCreated->modified;
        if ($l_contact == null) {
            $l_contact_human = null;
            $state = 'never';
        } else {
            $dead_after = $this->_get_dead_after($mesh_id);
            $last_timestamp = strtotime($l_contact);
            $l_contact_human = $this->TimeCalculations->time_elapsed_string($l_contact);
            if ($last_timestamp+$dead_after <= time()) {
                $state = 'down';
            } else {
                $state = 'up';
            }
        }

        $l_node = 'Data Not Available';
        if (array_key_exists($last_node_id,$this->node_lookup)){
            $l_node = $this->node_lookup[$last_node_id];
        }
        
        return [  
            'signal_bar'        => $signal_bar,
            'signal'            => $signal,              
            'l_tx_bitrate'      => $lastCreated->tx_bitrate,
            'l_rx_bitrate'      => $lastCreated->rx_bitrate,
            'l_signal'          => $lastCreated->signal_now,
            'l_signal_avg'      => $lastCreated->signal_avg,
            'l_tx_failed'       => $lastCreated->tx_failed,
            'l_tx_retries'      => $lastCreated->tx_retries,
            'l_modified'        => $lastCreated->modified,
            'state'             => $state,
            'l_modified_human'  => $this->TimeCalculations->time_elapsed_string($lastCreated->modified),
            'l_tx_bytes'        => $lastCreated->tx_bytes,
            'l_rx_bytes'        => $lastCreated->rx_bytes,
            'l_node'            => $l_node            
        ];        
    }
    
    private function _getLatsetNodeInfo($nodeId,$mesh_id,$macAddressId,$dead_after){
    
         //Get the latest entry
        $lastCreated = $this->NodeStations->find()->where([
            'mac_address_id'   => $macAddressId,
            'node_id'          => $nodeId
        ])->order(['created' => 'desc'])->first();

        $historical = false;          
        if(!$lastCreated){
            $historical = true;
            $lastCreated = $this->NodeStationHourlies->find()->where([
                'mac_address_id'   => $macAddressId,
                'node_id'          => $nodeId
            ])->order(['created'   => 'desc'])->first();     
        }
        
        if($historical){
            $signal = $lastCreated->signal_avg;
        }else{
            $signal = $lastCreated->signal_now;
        }      

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
        
        $last_mesh_entry_id = $lastCreated->mesh_entry_id;
        
        $l_client_contact       = $lastCreated->modified;
        $l_client_contact_human = $this->TimeCalculations->time_elapsed_string($l_client_contact);
            
        $last_client_timestamp = strtotime($l_client_contact);
        if ($last_client_timestamp+$dead_after <= time()) {
            $client_state = 'down';
        } else {
            $client_state = 'up';
        }           
    
        return [
            'signal_bar'        => $signal_bar,
            'signal'            => $signal,
            'l_tx_bitrate'      => $lastCreated->tx_bitrate,
            'l_rx_bitrate'      => $lastCreated->rx_bitrate,
            'l_signal'          => $lastCreated->signal_now,
            'l_signal_avg'      => $lastCreated->signal_avg,
            'l_tx_failed'       => $lastCreated->tx_failed,
            'l_tx_retries'      => $lastCreated->tx_retries,
            'l_modified'        => $lastCreated->modified,
            'l_modified_human'  => $this->TimeCalculations->time_elapsed_string($lastCreated->modified),
            'l_tx_bytes'        => $lastCreated->tx_bytes,
            'l_rx_bytes'        => $lastCreated->rx_bytes,
            'l_entry'           => $this->entry_lookup[$last_mesh_entry_id],
            'client_state'      => $client_state       
        ];    
    } 
}
