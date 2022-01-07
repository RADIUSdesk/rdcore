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
use Cake\Event\Event;
use Cake\Utility\Inflector;
use Cake\Utility\Text;

class TreeTagsController extends AppController {

    public $base = "Access Providers/Controllers/TreeTags/";
    protected $owner_tree = array();
    protected $main_model = 'TreeTags';
    
    protected $tree_level_0 = 'STATE';
    protected $tree_level_1 = 'DISTRICT';
    protected $tree_level_2 = 'BLOCK';
    
    protected $cls_level_0  = 'x-fa fa-building';
    protected $cls_level_1  = 'x-fa fa-cubes';
    protected $cls_level_2  = 'x-fa fa-cube';

    public function initialize(){
       
        $this->loadModel('TreeTags');
        $this->loadModel('Users');
        $this->loadModel('Meshes');
        $this->loadComponent('CommonQuery', [ //Very important to specify the Model
            'model' => 'TreeTags',
            'sort_by' => 'TreeTags.name'
        ]);
        $this->loadComponent('Aa');
        $this->loadComponent('GridButtons');
        
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');
        parent::initialize(); 
    }
    
    
    public function indexMeshOverview(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $tree_level = $this->tree_level_0;
        $tt_level   = 0;
        $conditions = ['TreeTags.parent_id IS NULL'];
        if(isset($this->request->query['node'])){
            if($this->request->query['node'] != 0){
                $id         = $this->request->query['node'];
                $conditions = ['TreeTags.parent_id' => $id];
                $tt_level = $this->{'TreeTags'}->getLevel($id)+1;
                if($tt_level == 1){
                    $tree_level = $this->tree_level_1;
                }
                if($tt_level == 2){
                    $tree_level = $this->tree_level_2;
                }             
            }    
        }
        
        $query  = $this->{$this->main_model}->find()->where($conditions);
        $q_r    = $query->all();
        $total  = $query->count();
        
        
        if($tt_level ==0){
            $icon_cls = $this->cls_level_0;
        }
        
        if($tt_level ==1){
            $icon_cls = $this->cls_level_1;
        }
        
        if($tt_level ==2){
            $icon_cls = $this->cls_level_2;
        }

        $items = [];
        $level = false;
        foreach($q_r as $i){      
            $leaf   = false;
            if($this->{$this->main_model}->childCount($i) == 0){
                $leaf       = true;
            }
            $level = $this->{$this->main_model}->getLevel($i);
            $network_count = $this->_infoBuilding($i->id,$leaf);
            if($network_count > 0){                         
                array_push($items,[
                    'id'        => $i->id, 
                    'text'      => $i->name." <span style='font-size:small;'><i>($network_count)</i></span>",
                    'networks'  => $network_count,
                    'leaf'      => $leaf,
                    'iconCls'   => $icon_cls,
                    'level'     => $level,
                    'cls'       => 'gridTree'
                ]);
            } 
        }
            
        $this->set(array(
            'items' => $items,
            'total' => $total,
            'success' => true,
            '_serialize' => array('items','success','total')
        ));
    }
    
    private function _infoBuilding($id,$leaf){
    
        if($leaf){
            $count = $this->{'Meshes'}->find()->where(['Meshes.tree_tag_id' => $id])->count();
            return $count;          
        }
        $children       = $this->{'TreeTags'}->find('children', ['for' => $id]);
        $where_clause   = [];
        $tree_array     = [];
        $count          = 0;
        if($children){   //Only if the AP has any children...
            foreach($children as $i){
                $id = $i->id;
                array_push($tree_array,['Meshes.tree_tag_id' => $id]);
            }       
        }
        
        if(count($tree_array) > 0){
            array_push($where_clause,['OR' => $tree_array]);
            $count = $this->{'Meshes'}->find()->where($where_clause)->count();
        }   
        return $count;     
    }
    
     
    public function index(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        $tree_level = $this->tree_level_0;
        $tt_level = 0;

        $conditions = ['TreeTags.parent_id IS NULL'];
        if(isset($this->request->query['node'])){
            if($this->request->query['node'] != 0){
                $id         = $this->request->query['node'];
                $conditions = ['TreeTags.parent_id' => $id];
                $tt_level = $this->{'TreeTags'}->getLevel($id)+1;
                if($tt_level == 1){
                    $tree_level = $this->tree_level_1;
                }
                if($tt_level == 2){
                    $tree_level = $this->tree_level_2;
                }             
            }    
        }
        //We only will list the first level of nodes

        $query  = $this->{$this->main_model}->find()->where($conditions);
        $q_r    = $query->all();
        $total  = $query->count();
        
        
        if($tt_level ==0){
            $icon_cls = $this->cls_level_0;
        }
        
        if($tt_level ==1){
            $icon_cls = $this->cls_level_1;
        }
        
        if($tt_level ==2){
            $icon_cls = $this->cls_level_2;
        }

        $items = [];
        foreach($q_r as $i){

            $id         = $i->id;
            $parent_id  = $i->parent_id;
            $alias      = $i->name;
            $comment    = $i->comment;
            $center_lat = $i->center_lat;
            $center_lng = $i->center_lng;
            $kml_file   = $i->kml_file;
            
            $created_in_words   = $this->TimeCalculations->time_elapsed_string($i->{'created'});
            $modified_in_words  = $this->TimeCalculations->time_elapsed_string($i->{'modified'});

            $leaf       = false;
            //$icon_cls   = '';
            $nav_pad	= 10;
            $node = $this->{$this->main_model}->get($id);
            if($this->{$this->main_model}->childCount($node) == 0){
                $leaf       = true;
                //$icon_cls   = 'list';
            }
                     
            
            array_push($items,[
                'id'        => $id, 
                'name'      => $alias, 
                'text'      => $alias,
                'parent_id' => $parent_id,
                'leaf'      => $leaf,
                'nav_pad'   => $nav_pad,
                'comment'   => $comment, 
                'center_lat'=> $center_lat,
                'center_lng'=> $center_lng,
                'kml_file'  => $kml_file,
                'iconCls'   => $icon_cls,
                'tree_level'=> $tree_level,
                'created'   => $i->{'created'},
                'modified'  => $i->{'modified'},
                'created_in_words'   => $created_in_words,
                'modified_in_words'  => $modified_in_words
            ]); 
        }
            
        $this->set(array(
            'items' => $items,
            'total' => $total,
            'success' => true,
            '_serialize' => array('items','success','total')
        ));
    }
    
    public function add(){
    /*
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } */
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
    
        if ($this->request->is('post')) {
            if($this->request->data['parent_id'] == 0){
                $this->request->data['parent_id'] = null;            
            } 
            $entity = $this->{$this->main_model}->newEntity($this->request->data());   
            if ($this->{$this->main_model}->save($entity)) {
                $this->set(array(
                    'success' => true,
                    '_serialize' => array('success')
                ));
            } else {
                $message = __('Could not update item');
                $this->JsonErrors->entityErros($entity,$message);
            }    
        }
    }
    
    public function edit(){
/*
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        }*/
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        if ($this->request->is('post')) {
            if($this->request->data['parent_id'] == 0){
                $this->request->data['parent_id'] = null;            
            }

            if($this->request->data['id'] == 0){
                $this->set(array(
                    'success' => false,
                    'message' => array('message' => __('Not allowed to change root node')),
                    '_serialize' => array('success','message')
                ));
            }else{
                $entity = $this->{$this->main_model}->get($this->request->data['id']);
                $this->{$this->main_model}->patchEntity($entity, $this->request->data());  
                if ($this->{$this->main_model}->save($entity)) {
                    $this->set(array(
                        'success' => true,
                        '_serialize' => array('success')
                    ));
                } else {
                    $message = __('Could not update item');
                    $this->JsonErrors->entityErros($entity,$message);
                }   
            }
        }
    }
   
    public function delete(){
    /*
        if(!$this->Aa->admin_check($this)){   //Only for admin users!
            return;
        } 
        */
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        if(isset($this->request->data['id'])){   //Single item delete
            $entity = $this->{$this->main_model}->get($this->request->data['id']); 
            $this->{$this->main_model}->delete($entity);
        }else{                          //Assume multiple item delete
            foreach($this->request->data as $d){
                $entity = $this->{$this->main_model}->get($this->request->data['id']);
                $this->{$this->main_model}->delete($entity);
            }
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
    public function mapDelete(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));  
    }
    public function mapSave(){
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        
        if(isset($this->request->query['id'])){
            if((isset($this->request->query['lat']))&&(isset($this->request->query['lon']))){
                $entity = $this->{$this->main_model}->get($this->request->query['id']);
                $lat = $this->request->query['lat'];
                $lon = $this->request->query['lon'];
                $this->{$this->main_model}->patchEntity($entity,['center_lat' => $lat,'center_lng' => $lon]);
                $this->{$this->main_model}->save($entity);      
            } 
        }
        
        $this->set(array(
            'success' => true,
            '_serialize' => array('success')
        ));
    }
}
