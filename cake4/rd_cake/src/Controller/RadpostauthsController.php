<?php

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Utility\Inflector;
use Zend\Diactoros\Stream;

class RadpostauthsController extends AppController {

    public $base = "Access Providers/Controllers/Radpostauths/";
    protected $main_model = 'Radpostauths';

    public function initialize():void{
        parent::initialize();
        $this->loadModel($this->main_model);
        $this->loadModel('Users');
        $this->loadComponent('Aa');
        $this->loadComponent('GridFilter');
        $this->loadComponent('JsonErrors');
        $this->loadComponent('TimeCalculations');
    }


    //-------- BASIC CRUD -------------------------------
    
     public function exportCsv(){

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        //Build query
        $user_id    = $user['id'];

        $query = $this->{$this->main_model}->find();

        $this->_build_common_query($query, $user);

        $q_r = $query->all();

        //Headings
        $heading_line   = [];
        if(null !== $this->request->getQuery('columns')){
            $columns = json_decode($this->request->getQuery('columns'));
            foreach($columns as $c){             
                array_push($heading_line,$c->name);
            }
        }
        $data = [
            $heading_line
        ];

        //Results
        foreach($q_r as $i){
            $columns    = [];
            $csv_line   = [];
            if(null !== $this->request->getQuery('columns')){
                $columns = json_decode($this->request->getQuery('columns'));
                foreach($columns as $c){                    
                	$column_name = $c->name;                   
                 	array_push($csv_line,$i->$column_name);

                }
                array_push($data,$csv_line);
            }
        }
        
        $_serialize = 'data';
        $this->setResponse($this->getResponse()->withDownload('Radpostauths.csv'));
        $this->viewBuilder()->setClassName('CsvView.Csv');
        $this->set(compact('data', '_serialize'));  
        
    }
    
    public function index(){
        $cquery = $this->request->getQuery();
        //-- Required query attributes: token;
        //-- Optional query attribute: sel_language (for i18n error messages)
        //-- also LIMIT: limit, page, start (optional - use sane defaults)
        //-- FILTER <- This will need fine tunning!!!!
        //-- AND SORT ORDER <- This will need fine tunning!!!!

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }
     /*   
        if(
            ($user['group_name'] !== 'Administrators')&&
            ($this->request->getQuery('username')  == null )
        ){
            $this->set([
                'items'         => [],
                'success'       => true,
                'totalCount'    => 0,
                '_serialize'    => ['items','success','totalCount']
            ]);
            return; //Only admins not filtered
        }*/

        $query  = $this->{$this->main_model}->find();
        $this->_build_common_query($query, $user, []); //AP QUERY is sort of different in a way
        
        if($this->request->getQuery('username')  !== null ){
            $un = $this->request->getQuery('username');
            $query->where(['Radpostauths.username' => $un]);
        }
        //===== PAGING (MUST BE LAST) ======
        $limit  = 50;   //Defaults
        $page   = 1;
        $offset = 0;

        if(isset($cquery['limit'])){
            $limit  = $cquery['limit'];
            $page   = $cquery['page'];
            $offset = $cquery['start'];
        }

        $query->page($page);
        $query->limit($limit);
        $query->offset($offset);

        $total = $query->count();
        $q_r = $query->all();
        
        $items  = [];

        foreach($q_r as $i){ 
            array_push($items,
                [
                    'id'                => $i->id,
                    'username'          => $i->username,
                    'pass'              => $i->pass,
                    'realm'             => $i->realm,
                    'reply'             => $i->reply,
                    'nasname'           => $i->nasname,
                    'authdate'          => $i->authdate
                ]
            );
        }                
        $this->set([
            'items'         => $items,
            'success'       => true,
            'totalCount'    => $total,
            '_serialize'    => ['items','success','totalCount']
        ]);
    }

    public function add(){

        $cdata = $this->request->getData();
        
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        $cdata['active']       = 0;
        $cdata['monitor']      = 0;     


        //Two fields should be tested for first:
        if(array_key_exists('active', $cdata)){
            $cdata['active'] = 1;
        }

        if(array_key_exists('monior', $cdata)){
            $cdata['monitor'] = 1;
        }

        if($cdata['parent_id'] == '0'){ //This is the holder of the token
            $cdata['parent_id'] = $user['id'];
        }

        if(!array_key_exists('language',$cdata)){
            $cdata['language'] = Configure::read('language.default');
        }

        //Get the language and country
        $country_language   = explode( '_', $cdata['language'] );

        $country            = $country_language[0];
        $language           = $country_language[1];

        $cdata['language_id'] = $language;
        $cdata['country_id']  = $country;

        //Get the group ID for AP's
        $group_name = Configure::read('group.user');

        $this->loadModel('Groups');

        $q_r = $this->Groups->find()->where(['Groups.name' => $group_name])->first();

        $group_id   = $q_r->id;
        $cdata['group_id'] = $group_id;

        //Zero the token to generate a new one for this user:
        $cdata['token'] = '';

        //The rest of the attributes should be same as the form..
        $radPostAuthEntity = $this->{$this->main_model}->newEntity($cdata);

        if ($this->{$this->main_model}->save($radPostAuthEntity)) {
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        } else {
            $message = 'Error';
            $this->set([
                'errors'    => $this->JsonErrors->entityErros($radPostAuthEntity, $message),
                'success'   => false,
                'message'   => ['message' => __('Could not create item')],
                '_serialize' => ['errors','success','message']
            ]);
        }
    }

    public function delete($id = null) {
        $cdata = $this->request->getData();

		if (!$this->request->is('post')) {
			throw new MethodNotAllowedException();
		}

        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if(!$user){
            return;
        }

        //FIXME We need to find a creative wat to determine if the Access Provider can delete this accounting data!!!
	    if(isset($cdata['id'])){   //Single item delete
            $deleteEntity = $this->{$this->main_model}->get($cdata['id']);
            $this->{$this->main_model}->delete($deleteEntity);
        }else{                          //Assume multiple item delete
            foreach($cdata as $d){
                $deleteEntity = $this->{$this->main_model}->get($d['id']);
                $this->{$this->main_model}->delete($deleteEntity);
            }
        }

        $fail_flag = false;
        if($fail_flag == true){
            $this->set([
                'success'   => false,
                'message'   => ['message' => __('Could not delete some items')],
                '_serialize' => ['success','message']
            ]);
        }else{
            $this->set([
                'success' => true,
                '_serialize' => ['success']
            ]);
        }
	}

    //--------- END BASIC CRUD ---------------------------

    //----- Menus ------------------------
    public function menuForGrid(){

        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }

        //Empty by default
        $menu = [];

        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin

            $menu = [
                [
                    'xtype' => 'buttongroup',
                    'title' => null, 
                    'items' => [
                        [
                            'xtype'     =>  'splitbutton',
                            'glyph'     => Configure::read('icnReload'),
                            'scale'     => 'large', 
                            'itemId'    => 'reload',   
                            'tooltip'   => __('Reload'),
                            'menu'  => [
                                'items' => [
                                    '<b class="menu-title">Reload every:</b>',
                                    ['text'  => _('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ],
                                    ['text'  => _('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false],
                                    ['text'  => _('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ],
                                    ['text'  => _('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true ]
                                ]
                            ]
                        ]                    
                    ]
                ],
                [
                    'xtype' => 'buttongroup', 
                    'width' => 75 ,'title' => null, 
                    'items' => [
                        [
                            'xtype'     => 'button',
                            'glyph'     => Configure::read('icnCsv'),
                            'scale'     => 'large', 
                            'itemId'    => 'csv',      
                            'tooltip'   => __('Export CSV')
                        ]
                    ]
                ]
            ];
        }

        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)

            $id             = $user['id'];
            $action_group   = [];
            $document_group = [];
            $specific_group = [];
            //Reload
            array_push($action_group,[ 
                'xtype'     =>  'splitbutton',  
                'iconCls'   => 'b-reload',
                'glyph'     => Configure::read('icnReload'),   
                'scale'     => 'large', 
                'itemId'    => 'reload',   
                'tooltip'   => __('Reload'),
                'menu'      => [             
                    'items'     => [ 
                    '<b class="menu-title">Reload every:</b>',
                    ['text'  => _('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ],
                    ['text'  => _('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false],
                    ['text'  => _('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ],
                    ['text'  => _('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true ]
                ]
                ]
            ]);

            

            if($this->Acl->check(['model' => 'Users', 'foreign_key' => $id], $this->base.'export_csv')){
                array_push($document_group,[
                    'xtype'     => 'button', 
                    'iconCls'   => 'b-csv',
                    'glyph'     => Configure::read('icnCsv'),     
                    'scale'     => 'large', 
                    'itemId'    => 'csv',      
                    'tooltip'   => __('Export CSV')]);
            }

            $menu = [
                        ['xtype' => 'buttongroup','title' => null,                 'items' => $action_group],
                        ['xtype' => 'buttongroup','title' => null,  'width'=> 75,  'items' => $document_group]
            ];
        }
        $this->set([
            'items'         => $menu,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);
    }

    //______ END EXT JS UI functions ________
    private function _find_parents($id){

        $this->loadModel('Users');

        return $this->Users->find_parents($id);
    }
    
   function _build_common_query($query, $user){

        $where = [];
        $joins = [];
        $req_q = $this->request->getQuery();
        
		//Make sure there is a cloud id
        if(!isset($req_q['cloud_id'])){
        	$this->Aa->fail_no_rights("Required Cloud ID Missing");
        	return false;
       	}    
                                    
        //===== SORT =====
        //Default values for sort and dir
        $sort   = 'Radpostauths.username';
        $dir    = 'DESC';

        if(null !== $this->request->getQuery('sort')){
            $sort = $this->main_model.'.'.$this->request->getQuery('sort');
            $dir  = $this->request->getQuery('dir');
        }
        $query->order([$sort => $dir]);
        //==== END SORT ===

        //======= For a specified username filter *Usually on the edit of user / voucher ======
        if(null !== $this->request->getQuery('username')){
            $un = $this->request->getQuery('username');
            array_push($where, [$this->main_model.".username" => $un]);
        }

        //====== REQUEST FILTER =====
        if(null !== $this->request->getQuery('filter')){
            $filter = json_decode($this->request->getQuery('filter'));
            foreach($filter as $f){

                $f = $this->GridFilter->xformFilter($f);

                //Strings
                if($f->type == 'string'){

                    $col = $this->main_model.'.'.$f->field;
                    array_push($where, ["$col LIKE" => '%'.$f->value.'%']);
 
                }
                //Bools
                if($f->type == 'boolean'){
                   
                }
                //Date
                if($f->type == 'date'){
                    //date we want it in "2013-03-12"
                    $col = $this->main_model.'.'.$f->field;
                    if($f->comparison == 'eq'){
                        array_push($where, ["DATE($col)" => $f->value]);
                    }

                    if($f->comparison == 'lt'){
                        array_push($where, ["DATE($col) <" => $f->value]);
                    }
                    if($f->comparison == 'gt'){
                        array_push($where, ["DATE($col) >" => $f->value]);
                    }
                }
            }
        }
        //====== END REQUEST FILTER =====
        
         //====== CLOUD's Realms FILTER =====  
      	$this->loadModel('Realms'); 	
      	$realm_clause = [];
      	$found_realm  = false;
     	$q_realms  = $this->{'Realms'}->find()->where(['Realms.cloud_id' => $req_q['cloud_id']])->all();
      	foreach($q_realms as $r){
      		$found_realm = true;
          	array_push($realm_clause, [$this->main_model.'.realm' => $r->name]);
     	}
     	if($found_realm){
     		array_push($where, ['OR' => $realm_clause]);
     	}else{
     		$this->Aa->fail_no_rights("No Realms owned by this cloud"); //If the list of realms for this cloud is empty reject the request
        	return false;
     	}      
        //====== END Realm FILTER =====   
        $query->where($where);           
        return true;
    }

}
