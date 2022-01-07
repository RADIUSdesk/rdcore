<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 27/09/2017
 * Time: 00:00
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class MeshOverviewMapsController extends AppController {

    public $base = "Access Providers/Controllers/TreeTags/";
    protected $owner_tree = array();
    protected $main_model = 'TreeTags';
    
    protected $tree_level_0 = 'STATE';
    protected $tree_level_1 = 'DISTRICT';
    protected $tree_level_2 = 'BLOCK';
    
    protected $cls_level_0  = 'x-fa fa-building';
    protected $cls_level_1  = 'x-fa fa-cubes';
    protected $cls_level_2  = 'x-fa fa-cube';
    
    protected $meta_data    = [];
    protected $level_gui    = [
        ['name' => 'States',    'fa_icon' => 'building'],
        ['name' => 'Districts', 'fa_icon' => 'cubes'],
        ['name' => 'Blocks',    'fa_icon' => 'cube'],
    ];
    protected $level_stats  = [];
    protected $timespan = 'weekly';

    public function initialize(){
        parent::initialize();
        $this->loadModel('TreeTags');
        $this->loadModel('Users');
        $this->loadModel('Meshes');
        $this->loadModel('Nodes');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'TreeTags',
            'sort_by' => 'TreeTags.name'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');      
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations'); 
    }
    
    public function mapSave(){ 
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        if ($this->request->is('post')) {

            if(isset($this->request->data['id'])){
                $id = $this->request->data['id'];
                $nodes = $this->{'Nodes'}->find()->where(['Nodes.mesh_id' =>$id])->all();
                if($nodes){
                    if($nodes->count() == 1){
                        $node = $nodes->first();
                        $node->lat = $this->request->data['lat'];
                        $node->lon = $this->request->data['lon'];
                        $this->{'Nodes'}->save($node);
                        //ALSO PUT THE CENTRE OF THE MAP for MESH VIEW MAYBE?
                    }else{
                        #FIXME try and only put it  on the GW
                        $node = $nodes->first();
                        $node->lat = $this->request->data['lat'];
                        $node->lon = $this->request->data['lon'];
                        $this->{'Nodes'}->save($node);         
                    }    
                }
                
            }            
        }   
        $this->set([
            'success'   => true,
            '_serialize' => ['success']
        ]);
    } 
    
    public function index(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $timespan    = $this->request->getQuery('timespan');
        
        if($timespan){
            $this->timespan = $timespan;
        }
        
        $tree_level = $this->tree_level_0;
        $tt_level   = 0;
        $conditions = ['TreeTags.parent_id IS NULL'];
        $this->meta_data['level_stats'] = [];
        $this->_meta_data_for_id(0);
        
        if(isset($this->request->query['tree_tag_id'])){
            if($this->request->query['tree_tag_id'] != 0){
                $id         = $this->request->query['tree_tag_id'];
                $this->_meta_data_for_id($id);
                $conditions = ['TreeTags.parent_id' => $id];                        
            }    
        }
        
        $query  = $this->{$this->main_model}->find()->where($conditions);
        $q_r    = $query->all();
        $total  = $query->count();
       
        $items  = [];
        $level  = false;
        $total_networks = 0;
        $total_nodes    = 0;
        
        $total_networks_online    = 0;
        $total_nodes_online       = 0;
        
        if($q_r->count()>0){
            foreach($q_r as $i){      
                $leaf   = false;
                if($this->{$this->main_model}->childCount($i) == 0){
                    $leaf       = true;
                }
                $level  = $this->{$this->main_model}->getLevel($i);             
                $counts = $this->_infoBuilding($i->id);
                $network_count = $counts['meshes'];
   
                if($network_count > 0){ //Show only those with networks associated        
                    if(isset($this->level_stats[$level])){
                        $this->level_stats[$level]['count'] = $this->level_stats[$level]['count']+1;
                    }else{
                        $icon = $this->level_gui[$level]['fa_icon'];
                        $name = $this->level_gui[$level]['name'];
                        $this->level_stats[$level] = ['name' => $name ,'fa_icon' => $icon,'count' =>1]; //Initiate it
                    }
                
                    $total_networks = $total_networks+$network_count;
                    $total_nodes    = $total_nodes + $counts['nodes'];
                    $total_networks_online = $total_networks_online + $counts['meshes_online'];
                    $total_nodes_online    = $total_nodes_online + $counts['nodes_online'];         
                                 
                    array_push($items,[
                        'id'            => $i->id, 
                        'text'          => $i->name,
                        'center_lat'    => $i->center_lat,
                        'center_lng'    => $i->center_lng,
                        'networks'      => $network_count,
                        'level'         => $level,
                        'leaf'          => $leaf,
                        'cls'           => 'gridTree',
                        'draggable'     => false
                    ]); 
                }
            }
        }else{
            //There might not be children which means this guy is at the end of the road so we need to check its meshes
            $node = $this->{$this->main_model}->find()->where(['TreeTags.id' => $id])->first();
            if($node){
                if($this->{$this->main_model}->childCount($node) == 0){
                
                    $ft_day = FrozenTime::now();
                    $cut_off = $ft_day->subDay(1);
                    if($this->timespan == 'weekly'){
                        $cut_off = $ft_day->subDay(7);
                    }
                    if($this->timespan == 'monthly'){
                        $cut_off = $ft_day->subDay(30);
                    }
                
                    $level      = $this->{$this->main_model}->getLevel($node);
                    $ent_meshes = $this->{'Meshes'}->find()->where(['tree_tag_id'=>$id])->contain(['Nodes'])->all();
                    $total_networks_online = $this->{'Meshes'}->find()->where(['tree_tag_id'=>$id,'last_contact >=' => $cut_off])->count();

                    $not_found  = true;
                    $node_mesh_ids = [];
                    $total      = 0;
                    $offset_x   = 0.02;
                    $offset_y   = 0.02;
                    foreach($ent_meshes as $mesh){
                    
                        array_push($node_mesh_ids,$mesh->id);
                    
                        $total_networks = $total_networks+1;
                    
                        $not_found = false; //There were some messes associated to this tree node
                    
                        //We mark the meshes as one of a.)No Nodes b.)Nodes but not placed c.)Placed Nodes
                        $mesh_nodes_placed = false;
                        $mesh_nodes_found  = false;
                        
                        //print_r($mesh);
                    
                        foreach($mesh->nodes as $mesh_node){
                            $mesh_nodes_found = true;
                            if($mesh_node->lat !== null){    
                                $mesh_nodes_placed = true;
                                break;  
                            }  
                        }
                        
                        if($mesh_nodes_found == false){ //No Nodes
                            array_push($items,[
                                'id'            => $mesh->id, 
                                'text'          => $mesh->name,
                                'center_lat'    => $node->center_lat+($total*$offset_x),
                                'center_lng'    => $node->center_lng+($total*$offset_y),
                                'draggable'     => false,
                                'mesh_id'       => $mesh->id,
                                'status'        => 'no_nodes',
                                'level'         => $level+1, //Mesh is next level
                                'cls'           => 'gridTree'
                            ]); 
                        }
                        
                        if($mesh_nodes_found == true){ //No Nodes
                            if($mesh_nodes_placed == true){
                            
                                $status = 'placed_offline';
                                if($mesh->last_contact > $cut_off){
                                    $status = 'placed_online';
                                }
                                                          
                                array_push($items,[
                                    'id'            => $mesh->id, 
                                    'text'          => $mesh->name,
                                    'center_lat'    => $mesh_node->lat,
                                    'center_lng'    => $mesh_node->lon,//Headsup not lng
                                    'mesh_node_id'  => $mesh_node->id,
                                    'mesh_id'       => $mesh->id,
                                    'draggable'     => true,
                                    'status'        => $status,
                                    'level'         => $level+1, //Mesh is next level
                                    'cls'           => 'gridTree'
                                ]);
                            }else{
                                $first_mesh_node = $mesh->nodes[0];  
                                array_push($items,[
                                    'id'            => $mesh->id, 
                                    'text'          => $mesh->name,
                                    'center_lat'    => $node->center_lat+($total*$offset_x),
                                    'center_lng'    => $node->center_lng+($total*$offset_y),
                                    'mesh_node_id'  => $first_mesh_node->id,
                                    'mesh_id'       => $mesh->id,
                                    'draggable'     => true,
                                    'status'        => 'not_placed',
                                    'level'         => $level+1, //Mesh is next level
                                    'cls'           => 'gridTree'
                                ]);
                                $total = $total+1;
                            } 
                        }
                    }
                    
                    if($not_found){
                         array_push($items,[
                            'id'            =>  $node->id, 
                            'text'          => 'No Network Associations',
                            'center_lat'    => $node->center_lat,
                            'center_lng'    => $node->center_lng,
                            'draggable'     => false,
                            'status'        => 'no_meshes',
                            'level'         => $level+1, //Mesh is next level
                            'cls'           => 'gridTree'
                        ]);
                        $total = 1;                      
                    }else{
                        //We need to grab the node count for those meshes
                        if(count($node_mesh_ids)>0){
                            $total_nodes = $this->{'Nodes'}->find()->where(['mesh_id IN' => $node_mesh_ids])->count();
                            $total_nodes_online = $this->{'Nodes'}->find()->where(['mesh_id IN' => $node_mesh_ids,'last_contact >=' => $cut_off])->count();
                        }
                    }           
                }
            }       
        }
        
        if(($level > 0)&&($level <=2)){   
            $parents = $this->{'TreeTags'}->find('path',['for' => $id]);
            //So we loop this results asking for the parent nodes who have available_to_siblings = true
            foreach($parents as $p){
                $p_id = $p->id;
                if($p_id != $id){ //upstream 
                    $p_level = $this->{$this->main_model}->getLevel($p);
                    $icon = $this->level_gui[$p_level]['fa_icon'];
                    $l_ent = ['name' => $p->name ,'fa_icon' => $icon]; //Initiate it
                    array_push($this->meta_data['level_stats'],$l_ent);
                }
            }  
        }                
        $levels_deep = [0,1,2,3,4];
        foreach($levels_deep as $ls){ 
            if(isset($this->level_stats[$ls])){          
                array_push($this->meta_data['level_stats'],$this->level_stats[$ls]);
            }      
        }
        
        $this->meta_data['total_networks']          = $total_networks;
        $this->meta_data['total_networks_online']   = $total_networks_online;
        $this->meta_data['total_nodes']             = $total_nodes;  
        $this->meta_data['total_nodes_online']      = $total_nodes_online;  
            
        $this->set(array(
            'items'     => $items,
            'total'     => $total,
            'metaData'  => $this->meta_data,
            'success'   => true,
            '_serialize' => array('items','success','total','metaData')
        ));
    }
    
    private function _infoBuilding($id){
        $children       = $this->{'TreeTags'}->find('children', ['for' => $id]);
        $where_clause   = [];
        $tree_array     = [];
        
        $nodes_count    = 0;
        $meshes_count   = 0;
        
        $mesh_tree_tag_ids = [$id];//Add this one by default 
        
        if($children){   //Only if the AP has any children...
            foreach($children as $i){
                $id         = $i->id;
                $level      = $this->{$this->main_model}->getLevel($i);
                if(isset($this->level_stats[$level])){
                    $this->level_stats[$level]['count'] = $this->level_stats[$level]['count']+1;
                }else{
                    $icon = $this->level_gui[$level]['fa_icon'];
                    $name = $this->level_gui[$level]['name'];
                    $this->level_stats[$level] = ['name' => $name,'fa_icon' => $icon,'count' =>1]; //Initiate it
                }                
                array_push($mesh_tree_tag_ids,$id);

            }       
        }

        //Mesh Count     
        $meshes_where = ['tree_tag_id IN' => $mesh_tree_tag_ids];
        $meshes_count = $this->{'Meshes'}->find()->where($meshes_where)->count();
        
        $ft_day = FrozenTime::now();
        $cut_off = $ft_day->subDay(1);
        if($this->timespan == 'weekly'){
            $cut_off = $ft_day->subDay(7);
        }
        if($this->timespan == 'monthly'){
            $cut_off = $ft_day->subDay(30);
        }

        $meshes_online = $this->{'Meshes'}->find()
            ->where(['tree_tag_id IN' => $mesh_tree_tag_ids,'last_contact >=' => $cut_off])
            ->count();
        
        
        //Node Count
        $meshes         = $this->{'Meshes'}->find()->select(['id'])->where($meshes_where)->all();
        $node_mesh_ids  = [];
        foreach($meshes as $mesh){ 
            array_push($node_mesh_ids,$mesh->id);      
        }
        $nodes_count    = 0;
        $nodes_online   = 0;
        if(count($node_mesh_ids)>0){
            $nodes_count = $this->{'Nodes'}->find()->where(['mesh_id IN' => $node_mesh_ids])->count();
            $nodes_online = $this->{'Nodes'}->find()->where(['mesh_id IN' => $node_mesh_ids,'last_contact >=' => $cut_off])->count();
        }
           
        return [
            'meshes'    => $meshes_count,
            'nodes'     => $nodes_count,
            'meshes_online' => $meshes_online,
            'nodes_online'  => $nodes_online
        ];     
    }
         
    private function _meta_data_for_id($id){
    
        $ent    = $this->{$this->main_model}->find()->where(['id' => $id])->first();
           
        if($ent){
            $level  = $this->{$this->main_model}->getLevel($ent);
            $fa_icon    = 'building';
            $level_name = 'States';
            if($level == 1){
                $fa_icon    = 'cubes';
                $level_name = 'Districts';
            }
            if($level == 2){
                $fa_icon    = 'cube';
                $level_name = 'Blocks';
            }
            $this->meta_data['text']    = $ent->name;
            $this->meta_data['fa_icon'] = $fa_icon;
            $this->meta_data['level']   = $level;
            $this->meta_data['level_name']   = $level_name;
        }else{
            $this->meta_data['text']    = 'HOME';
            $this->meta_data['fa_icon'] = 'home';
            $this->meta_data['level']   = -1;
            $this->meta_data['level_name']   = 'HOME';
        }
    }
}
