<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to check and produce Ajax-ly called grid tooblaar items
//---- Date: 08-JUL-2025
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class GridButtonsRbaComponent extends Component {

    protected $components 	= ['GridButtonsBase'];
    
    public function returnButtons($role='admin',$specific = false){
    
        $ctrl_name  = $this->getController()->getRequest()->getParam('controller');      
        return $this->_rbaButtonsFor($ctrl_name,$role);
    }
       
    private function _rbaButtonsFor($ctrl_name,$role){
    
        $ctrl_name  = 'Rba'.$ctrl_name;     
        $fileName   = $ctrl_name.'.php'; // Replace with your config file name
        $filePath   = CONFIG . $fileName;

        if (!file_exists($filePath)) {
            return [];
        }
        
        Configure::load($ctrl_name);
        $acl  = Configure::read($ctrl_name);

        // Get allowed actions for the role
        $allowedActions = $acl[$role];
        
        if($ctrl_name == 'RbaPermanentUsers'){     
            return [
                $this->_fetchPuBasic($allowedActions),
                $this->_fetchPuCsvUpDown($allowedActions),
                $this->_fetchPuExtras($allowedActions),
            ];
        }
               
        if($ctrl_name == 'RbaProfiles'){     
            return [
                $this->_fetchProfiles($allowedActions)
            ];
        }
        
        if($ctrl_name == 'RbaProfileComponents'){     
            return [
                $this->_fetchProfileComponents($allowedActions)
            ];
        }
        
        if($ctrl_name == 'RbaRealms'){     
            return [
                $this->_fetchRealmsBasic($allowedActions),
                $this->_fetchRealmsCsvDown($allowedActions),
                $this->_fetchRealmsOther($allowedActions)               
            ];
        }
        
        if($ctrl_name == 'RbaNas'){     
            return [
                $this->_fetchNasBasic($allowedActions),
                $this->_fetchNasOther($allowedActions)               
            ];
        }
                    
    }
       
    //---Grid Permanent Users--- 
     
    private function _fetchPuBasic($allowedActions){       

        //--*--
        
        $items = [];
        
        if (in_array('*', $allowedActions)) {       
            $items = [
                $this->GridButtonsBase->btnReloadTimer,
                $this->GridButtonsBase->btnAdd,
                $this->GridButtonsBase->btnDelete,
			    $this->GridButtonsBase->btnEdit
            ];          
        } 
        
        //--Others--
        if(in_array('index', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnReloadTimer);      
        }
        if(in_array('add', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnAdd);      
        }
        if(in_array('delete', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnDelete);      
        }
        if(in_array('viewBasicInfo', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnEdit);      
        }
                
        $menu = ['xtype' => 'buttongroup','title' => null, 'items' => $items ];
                 
        return $menu;
    }
    
    private function _fetchPuExtras($allowedActions){
    
        $menu  = null;
        $items = [];
        
        if (in_array('*', $allowedActions)) {   

            $items = [
                [
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnEmail'),
                    'scale'     => $this->GridButtonsBase->scale, 
                    'itemId'    => 'email', 
                    'tooltip'   => __('e-Mail Credentials'),
                    'ui'        => $this->GridButtonsBase->btnUiMail
                ],
                $this->GridButtonsBase->btnPassword,
                $this->GridButtonsBase->btnEnable,
                $this->GridButtonsBase->btnRadius,
                $this->GridButtonsBase->btnGraph,
                $this->GridButtonsBase->btnByod,
                $this->GridButtonsBase->btnTopUp
            ];      
        }
        
        //--Others--
        if(in_array('emailUserDetails', $allowedActions)){
            array_push($items,[
                'xtype'     => 'button', 
                'glyph'     => Configure::read('icnEmail'),
                'scale'     => $this->GridButtonsBase->scale, 
                'itemId'    => 'email', 
                'tooltip'   => __('e-Mail Credentials'),
                'ui'        => $this->GridButtonsBase->btnUiMail
           ]);      
        }
        
        if(in_array('viewPassword', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnPassword);      
        }
        if(in_array('enableDisable', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnEnable);      
        }
        
        //'btnRadius',
        //'btnGraph',
        //'btnByod',
        //'btnTopup',
        if(in_array('btnRadius', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnRadius);      
        }
        
        if(in_array('btnGraph', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnGraph);      
        }       
        if(in_array('btnByod', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnByod);      
        }      
        if(in_array('btnTopup', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnTopUp);      
        }
        
         if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu; 

    }
    
    private function _fetchPuCsvUpDown($allowedActions){
    
        $menu  = null;
        $items = [];
        
        if (in_array('*', $allowedActions)) {       
            $items = [
                 $this->GridButtonsBase->btnCsvUpload,
                 $this->GridButtonsBase->btnCsvDownload               
            ];          
        } 
        
        //--Others--
        if(in_array('import', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnCsvUpload);      
        }
        if(in_array('exportCsv', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnCsvDownload);      
        }
        
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'width' => 110,
                'items' => $items
            ];  
        }     
        return $menu;    
    }
    
    //---END Grid Permanent Users---  
    
    //--- Grid Profiles ---
    
    private function _fetchProfiles($allowedActions){       

        $menu   = null;
        $items  = [];
        
        $edit   = [
            'xtype' 	=> 'splitbutton',   
            'glyph' 	=> Configure::read('icnEdit'),    
            'scale' 	=> $this->GridButtonsBase->scale, 
            'itemId' 	=> 'edit',      
            'tooltip'	=> __('Edit'),
            'ui'        => $this->GridButtonsBase->btnUiEdit,
            'menu'      => [
                    'items' => [
                        [ 'text'  => __('Simple Edit'),  	'itemId'    => 'simple', 	'group' => 'edit', 'checked' => true, 	'glyph' => Configure::read('icnEdit') ],
                        [ 'text'  => __('FUP Edit'),   		'itemId'    => 'fup', 		'group' => 'edit' ,'checked' => false, 	'glyph' => Configure::read('icnHandshake')], 
                        [ 'text'  => __('Advanced Edit'),   'itemId'    => 'advanced',	'group' => 'edit' ,'checked' => false, 	'glyph' => Configure::read('icnGears')],  
                    ]
            ]
        ];
              
        if (in_array('*', $allowedActions)) {       
            $items = [
                $this->GridButtonsBase->btnReload,
                $this->GridButtonsBase->btnAdd,
                $this->GridButtonsBase->btnDelete,
			    $edit,
			    $this->GridButtonsBase->btnProfComp
            ];          
        } 
        
        //--Others--
        if(in_array('index', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnReload);      
        }
        
        if(in_array('simpleAdd', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnAdd);      
        }
        
        if(in_array('delete', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnDelete);      
        }
        
        if((in_array('manageComponents', $allowedActions))||(in_array('simpleView', $allowedActions))||(in_array('fupView', $allowedActions))){
            array_push($items,$edit);      
        }
        
        if(in_array('btnProfileComponents', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnProfComp);
        }
              
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    }
        
    //--- END Grid Profiles ---
    
    //--- Grid ProfileComponents ---
    
    private function _fetchProfileComponents($allowedActions){       

        $menu   = null;
        $items  = [];
                     
        if (in_array('*', $allowedActions)) {       
            $items = [
                $this->GridButtonsBase->btnReload,
                $this->GridButtonsBase->btnAdd,
                $this->GridButtonsBase->btnDelete,
			    $this->GridButtonsBase->btnEdit
            ];          
        } 
        
        //--Others--
        if(in_array('index', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnReload);      
        }
        
        if(in_array('add', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnAdd);      
        }        
        
        if(in_array('delete', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnDelete);      
        }
        
        if(in_array('edit', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnEdit);      
        }
                     
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    }        
    //--- END Grid Profiles ---
    
   //--- Realms --- 
    private function _fetchRealmsBasic($allowedActions){       

        $menu   = null;
        $items  = [];
                     
        if (in_array('*', $allowedActions)) {       
            $items = [
                $this->GridButtonsBase->btnReload,
                $this->GridButtonsBase->btnAdd,
                $this->GridButtonsBase->btnDelete,
			    $this->GridButtonsBase->btnEdit
            ];          
        } 
        
        //--Others--
        if(in_array('index', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnReload);      
        }
        
        if(in_array('add', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnAdd);      
        }        
        
        if(in_array('delete', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnDelete);      
        }
        
        if(in_array('edit', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnEdit);      
        }
                     
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    }
    
    private function _fetchRealmsCsvDown($allowedActions){
    
        $menu  = null;
        $items = [];
        
        if (in_array('*', $allowedActions)) {       
            $items = [
                 $this->GridButtonsBase->btnCsvDownload               
            ];          
        } 
        
        //--Others--
        if(in_array('exportCsv', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnCsvDownload);      
        }
        
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'width' => 60,
                'items' => $items
            ];  
        }     
        return $menu;    
    }  
    
    private function _fetchRealmsOther($allowedActions){
    
        $menu   = null;
        $items  = [];
        
        $btnLogo = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnCamera'),
            'scale'     => $this->GridButtonsBase->scale, 
            'itemId'    => 'logo',     
            'tooltip'   => __('Edit logo')
        ];
        $btnVlan = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnTag'),
            'scale'     => $this->GridButtonsBase->scale, 
            'itemId'    => 'vlans',     
            'tooltip'   => __('Manage VLANs'),
            'ui'        => 'button-metal'
        ];
        $btnPmk = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnLock'),
            'scale'     => $this->GridButtonsBase->scale, 
            'itemId'    => 'pmks',     
            'tooltip'   => __('Manage PMKs'),
            'ui'        => 'button-metal'
        ];
        
        $btnPasspoint = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnWifi2'),
            'scale'     => $this->GridButtonsBase->scale, 
            'itemId'    => 'passpoint',     
            'tooltip'   => __('Passpoint/HS2.0'),
            'ui'        => 'button-metal'
        ];
     
        if (in_array('*', $allowedActions)) {       
            $items = [
                 $this->GridButtonsBase->btnGraph,
                 $btnLogo,
                 $btnVlan,
                 $btnPmk,
                 $btnPasspoint                              
            ];          
        } 
        
        //--Others--
        if(in_array('btnGraph', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnGraph);      
        }
        if(in_array('btnLogo', $allowedActions)){
            array_push($items,$btnLogo);      
        }
        if(in_array('btnVlan', $allowedActions)){
            array_push($items,$btnVlan);      
        }
        if(in_array('btnPmk', $allowedActions)){
            array_push($items,$btnPmk);      
        }
        
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    } 
    
    //--- END Realms ---      
    
    //--- Nas --- 
    private function _fetchNasBasic($allowedActions){       

        $menu   = null;
        $items  = [];
                     
        if (in_array('*', $allowedActions)) {       
            $items = [
                $this->GridButtonsBase->btnReload,
                $this->GridButtonsBase->btnAdd,
                $this->GridButtonsBase->btnDelete,
			    $this->GridButtonsBase->btnEdit
            ];          
        } 
        
        //--Others--
        if(in_array('index', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnReload);      
        }
        
        if(in_array('add', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnAdd);      
        }        
        
        if(in_array('delete', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnDelete);      
        }
        
        if(in_array('edit', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnEdit);      
        }
                     
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    }
      
    private function _fetchNasOther($allowedActions){
    
        $menu   = null;
        $items  = [];
                   
        if (in_array('*', $allowedActions)) {       
            $items = [
                 $this->GridButtonsBase->btnGraph                     
            ];          
        } 
               
        //--Others--
        if(in_array('btnGraph', $allowedActions)){
            array_push($items,$this->GridButtonsBase->btnGraph);      
        }      
        if(count($items)>0){
            $menu = [
                'xtype' => 'buttongroup',
                'title' => null, 
                'items' => $items
            ];  
        }     
        return $menu;    
    } 
    
    //--- END Nas ---      
    
}
