<?php

//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: 
//---- Date: 20-JUL-2022
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

use Cake\ORM\TableRegistry;

class WhiteLabelComponent extends Component {

	protected $root_user_id	= 44;
	protected $wallpaper	= "/cake4/rd_cake/img/wallpapers/1.jpg";	 

    public function detail($user_id){
    
        $wl 			= [];       
        $site_active 	= Configure::read('whitelabel.active');       
        if($site_active){
            //First we will get the site settings
            $wl['wl_active']    = 'wl_active';
            $wl['wl_header']    = Configure::read('whitelabel.hName');
            $wl['wl_h_bg']      = Configure::read('whitelabel.hBg');
            $wl['wl_h_fg']      = Configure::read('whitelabel.hFg');
            $wl['wl_footer']    = Configure::read('whitelabel.fName');
            $wl['wl_wallpaper'] = Configure::read('whitelabel.wallpaper');
   
            $img_active         = Configure::read('whitelabel.imgActive');
            if($img_active == true){
                $wl['wl_img_active']= 'wl_img_active';
            }       
            $wl['wl_img']       = Configure::read('paths.ap_logo_path').Configure::read('whitelabel.imgFile');
            $wl['wl_img_file']  = Configure::read('whitelabel.imgFile');
            
            //After we have the site settings lets see if the Access Provider has white label settings / IF NOT use root user's as reference
            $wl_for_ap          = $this->lookForUserSettings($user_id);  
            if (empty($wl_for_ap)) {                     
                $wl_for_root   = $this->lookForUserSettings($this->root_user_id);
                if(!empty($wl_for_root)){
                    if($wl_for_root['wl_active'] == 'wl_active'){ //Only if it is active!
                        $wl = $wl_for_root;
                    }    
                }
            }else{
                $wl = $wl_for_ap;
            }  
        }else{ 
            $wl['wl_active'] = false;
        }
        return $wl;
    }
    
    private function lookForUserSettings($user_id){  
        $user_settings  = TableRegistry::get('UserSettings');
        $q_r            = $user_settings->find()->where(['UserSettings.user_id' => $user_id])->all();          
        $looking_for    = ['wl_active','wl_header','wl_h_bg','wl_h_fg','wl_footer','wl_img_active','wl_img_file'];     
        $wl             = [];      
        foreach($q_r as $i){
            $item = $i->name;
            if (in_array($item, $looking_for)) {
            
                $wl["$item"] = $i->value;
                 
                if($item == 'wl_active'){
                    if($i->value == 0){
                        $wl["$item"] = 0;
                    }else{
                        $wl["$item"] = 'wl_active';
                    }      
                }
                
                if($item == 'wl_img_active'){
                    if($i->value == 0){
                        $wl["$item"] = 0;
                    }else{
                        $wl["$item"] = 'wl_img_active';
                    }   
                }
                if($item == 'wl_img_file'){
                    $wl['wl_img']  = Configure::read('paths.ap_logo_path').$wl['wl_img_file'];
                }     
                 
            }
        }
        $wl['wl_wallpaper'] = Configure::read('whitelabel.wallpaper'); //Set this manually for the user   
        return $wl;
    }
}

