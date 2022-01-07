<?php
namespace App\Shell\Task;

use Cake\Console\Shell;

class MigrateTask extends Shell{

    private $aro_ap_id = 3116;
    
    private $acos_entries_rename  = [
        'Ssids' => [
            ['old' => 'index_ap', 'new' => 'indexAp']
        ],
        'AccessProviders' => [
            ['old' => 'change_password',    'new' => 'changePassword'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel'],
            ['old' => 'enable_disable',     'new' => 'enableDisable']
        ],
        'Tags' => [
            ['old' => 'index_for_filter',   'new' => 'indexForFilter'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel']
        ],
        'Realms' => [
            ['old' => 'index_for_filter',   'new' => 'indexForFilter'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel'],
            ['old' => 'index_ap',           'new' => 'indexAp'],
            ['old' => 'update_na_realm',    'new' => 'updateNaRealm'],
            //Not listed here is uploadLogo
        ],
        'DynamicDetails' => [
            ['old' => 'upload_logo',        'new' => 'uploadLogo'],
            ['old' => 'index_photo ',       'new' => 'indexPhoto '],
            ['old' => 'upload_photo ',      'new' => 'uploadPhoto '],
            ['old' => 'delete_photo ',      'new' => 'deletePhoto'],
            ['old' => 'edit_photo',         'new' => 'editPhoto'],       
            ['old' => 'index_page',         'new' => 'indexPage'],
            ['old' => 'add_page',           'new' => 'addPage'],
            ['old' => 'edit_page',          'new' => 'editPage'],
            ['old' => 'delete_page',        'new' => 'deletePage'],         
            ['old' => 'index_pair',         'new' => 'indexPair'],
            ['old' => 'add_pair',           'new' => 'addPair'],
            ['old' => 'edit_pair',          'new' => 'editPair'],
            ['old' => 'delete_pair',        'new' => 'deletePair'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel'],   
            ['old' => 'edit_settings',      'new' => 'editSettings'],
            ['old' => 'view_social_login',  'new' => 'viewSocialLogin'],
            ['old' => 'edit_social_login',  'new' => 'editSocialLogin'],    
        ],
        'Profiles' => [
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel'],
            ['old' => 'index_ap',           'new' => 'indexAp'],
            ['old' => 'manage_components',  'new' => 'manageComponents'],
        ],
        'PermanentUsers' => [
            ['old' => 'view_basic_info',    'new' => 'viewBasicInfo'],
            ['old' => 'edit_basic_info',    'new' => 'editBasicInfo'],
            ['old' => 'view_personal_info', 'new' => 'viewPersonalInfo'],
            ['old' => 'edit_personal_info', 'new' => 'editPersonalInfo'],
            ['old' => 'private_attr_index', 'new' => 'privateAttrIndex'],
            ['old' => 'private_attr_add',   'new' => 'privateAttrAdd'],
            ['old' => 'private_attr_edit',  'new' => 'privateAttrEdit'],
            ['old' => 'private_attr_delete','new' => 'privateAttrDelete'],
            ['old' => 'change_password',    'new' => 'changePassword'],
            ['old' => 'enable_disable',     'new' => 'enableDisable'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'restrict_list_of_devices','new' => 'restrictListOfDevices'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel'],
            ['old' => 'auto_mac_on_off',    'new' => 'autoMacOnOff'],
            ['old' => 'view_password',      'new' => 'viewPassword']
        ],
        'Vouchers'      => [
            ['old' => 'view_basic_info',    'new' => 'viewBasicInfo'],
            ['old' => 'edit_basic_info',    'new' => 'editBasicInfo'],
            ['old' => 'private_attr_index', 'new' => 'privateAttrIndex'],
            ['old' => 'private_attr_add',   'new' => 'privateAttrAdd'],
            ['old' => 'private_attr_edit',  'new' => 'privateAttrEdit'],
            ['old' => 'private_attr_delete','new' => 'privateAttrDelete'],
            ['old' => 'change_password',    'new' => 'changePassword'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'export_pdf',         'new' => 'exportPdf'],
            ['old' => 'email_voucher_details', 'new' => 'emailVoucherDetails'],  
        ],
        'Devices'       => [
            ['old' => 'view_basic_info',    'new' => 'viewBasicInfo'],
            ['old' => 'edit_basic_info',    'new' => 'editBasicInfo'],
            ['old' => 'private_attr_index', 'new' => 'privateAttrIndex'],
            ['old' => 'private_attr_add',   'new' => 'privateAttrAdd'],
            ['old' => 'private_attr_edit',  'new' => 'privateAttrEdit'],
            ['old' => 'private_attr_delete','new' => 'privateAttrDelete'],
            ['old' => 'enable_disable',     'new' => 'enableDisable'],
            ['old' => 'export_csv',         'new' => 'exportCsv'],
            ['old' => 'note_index',         'new' => 'noteIndex'],
            ['old' => 'note_add',           'new' => 'noteAdd'],
            ['old' => 'note_del',           'new' => 'noteDel']   
        ],
        'AcosRights'    => [
            ['old' => 'index_ap',   'new' => 'indexAp'],
            ['old' => 'edit_ap',    'new' => 'editAp'],  
        ],
        
        //Add 0n 8November 2018
        'Nas'       => [
            ['old' => 'manage_tags',    'new' => 'manageTags'],
            ['old' => 'export_csv',     'new' => 'exportCsv'],
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_add',       'new' => 'noteAdd'],
            ['old' => 'note_del',       'new' => 'noteDel'],
            ['old' => 'add_direct',     'new' => 'addDirect'], 
            ['old' => 'add_open_vpn',   'new' => 'addOpenVpn'], 
            ['old' => 'add_dynamic',    'new' => 'addDynamic'],
            ['old' => 'add_pptp',       'new' => 'addPptp'],
            ['old' => 'view_openvpn',   'new' => 'viewOpenvpn'],
            ['old' => 'edit_openvpn',   'new' => 'editOpenvpn'], 
            ['old' => 'view_pptp',      'new' => 'viewPptp'], 
            ['old' => 'edit_pptp',      'new' => 'editPptp'], 
            ['old' => 'view_dynamic',   'new' => 'viewDynamic'], 
            ['old' => 'edit_dynamic',   'new' => 'editDynamic'],
            ['old' => 'view_nas',       'new' => 'viewNas'], 
            ['old' => 'edit_nas',       'new' => 'editNas'],
            ['old' => 'view_photo',     'new' => 'viewPhoto'], 
            ['old' => 'upload_photo',   'new' => 'uploadPhoto'],
            ['old' => 'view_map_pref',  'new' => 'viewMapPref'], 
            ['old' => 'edit_map_pref',  'new' => 'editMapPref'],
            ['old' => 'delete_map',     'new' => 'deleteMap'], 
            ['old' => 'editMap',        'new' => 'editMap'],        
        ],
        'Meshes'    => [
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_add',       'new' => 'noteAdd'],
            ['old' => 'note_del',       'new' => 'noteDel'],
            ['old' => 'mesh_entries_index',    'new' => 'meshEntriesIndex'],
            ['old' => 'mesh_entry_add',        'new' => 'meshEntryAdd'],
            ['old' => 'mesh_entry_edit',       'new' => 'meshEntryEdit'],
            ['old' => 'mesh_entry_view',       'new' => 'meshEntryView'],
            ['old' => 'mesh_entry_delete',     'new' => 'meshEntryDelete'],
            ['old' => 'mesh_settings_view',    'new' => 'meshSettingsView'],
            ['old' => 'mesh_settings_edit',    'new' => 'meshSettingsEdit'],
            ['old' => 'mesh_exits_index',      'new' => 'meshExitsIndex'],
            ['old' => 'mesh_exit_add',        'new' => 'meshExitAdd'],
            ['old' => 'mesh_exit_edit',       'new' => 'meshExitEdit'],
            ['old' => 'mesh_exit_view',       'new' => 'meshExitView'],
            ['old' => 'mesh_exit_delete',     'new' => 'meshExitDelete'],
            ['old' => 'mesh_nodes_index',     'new' => 'meshNodesIndex'],
            ['old' => 'mesh_node_add',        'new' => 'meshNodeAdd'],
            ['old' => 'mesh_node_edit',       'new' => 'meshNodeEdit'],
            ['old' => 'mesh_node_view',       'new' => 'meshNodeView'],
            ['old' => 'mesh_node_delete',     'new' => 'meshNodeDelete'],
            ['old' => 'mesh_entry_points',    'new' => 'meshEntryPoints'],
            ['old' => 'node_common_settings_view',  'new' => 'nodeCommonSettingsView'],
            ['old' => 'node_common_settings_edit',  'new' => 'nodeCommonSettingsEdit'],
            ['old' => 'static_entry_options',       'new' => 'staticEntryOptions'],
            ['old' => 'static_exit_options',        'new' => 'staticExitOptions'],
            ['old' => 'map_pref_view',          'new' => 'mapPrefView'],
            ['old' => 'map_pref_edit',          'new' => 'mapPrefEdit'],
            ['old' => 'map_node_save',          'new' => 'mapNodeSave'],
            ['old' => 'map_node_delete',        'new' => 'mapNodeDelete'],
            ['old' => 'nodes_avail_for_map',    'new' => 'nodesAvailForMap'],
            ['old' => 'mesh_exit_add_defaults', 'new' => 'meshExitAddDefaults'],
        ],
        'ApProfiles'    => [
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_add',       'new' => 'noteAdd'],
            ['old' => 'note_del',       'new' => 'noteDel'],
            ['old' => 'ap_profile_entries_index',   'new' => 'apProfileEntriesIndex'],
            ['old' => 'ap_profile_entry_add',       'new' => 'apProfileEntryAdd'],
            ['old' => 'ap_profile_entry_edit',      'new' => 'apProfileEntryEdit'],
            ['old' => 'ap_profile_entry_view',      'new' => 'apProfileEntryView'],
            ['old' => 'ap_profile_entry_delete',    'new' => 'apProfileEntryDelete'],
            ['old' => 'ap_profile_exits_index',     'new' => 'apProfileExitsIndex'],
            ['old' => 'ap_profile_exit_add',        'new' => 'apProfileExitAdd'],
            ['old' => 'ap_profile_exit_edit',       'new' => 'apProfileExitEdit'],
            ['old' => 'ap_profile_exit_view',       'new' => 'apProfileExitView'],
            ['old' => 'ap_profile_exit_delete',     'new' => 'apProfileExitDelete'],
            ['old' => 'ap_profile_entry_points',    'new' => 'apProfileEntryPoints'],
            ['old' => 'ap_common_settings_view',    'new' => 'apCommonSettingsView'],
            ['old' => 'ap_common_settings_edit',    'new' => 'apCommonSettingsEdit'],
            ['old' => 'advanced_settings_for_model','new' => 'advancedSettingsForModel'],
            ['old' => 'ap_profile_ap_index',        'new' => 'apProfileApIndex'],
            ['old' => 'ap_profile_ap_add',          'new' => 'apProfileApAdd'],
            ['old' => 'ap_profile_ap_edit',         'new' => 'apProfileApEdit'],
            ['old' => 'ap_profile_ap_view',         'new' => 'apProfileApView'],
            ['old' => 'ap_profile_ap_delete',       'new' => 'apProfileApDelete'],
            ['old' => 'ap_profile_exit_add_defaults', 'new' => 'apProfileExitAddDefaults'],
        ],
        'DynamicClients'    => [
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_add',       'new' => 'noteAdd'],
            ['old' => 'note_del',       'new' => 'noteDel'],
            ['old' => 'clients_avail_for_map',       'new' => 'clientsAvailForMap'],
            ['old' => 'view_photo',     'new' => 'viewPhoto'],
            ['old' => 'view_map_pref',     'new' => 'viewMapPref'],
            ['old' => 'edit_map_pref',     'new' => 'editMapPref'],
            ['old' => 'delete_map',        'new' => 'deleteMap'],
            ['old' => 'edit_map',          'new' => 'editMap'],
        ],
        'ProfileComponents'    => [
            ['old' => 'note_index',     'new' => 'noteIndex'],
            ['old' => 'note_add',       'new' => 'noteAdd'],
            ['old' => 'note_del',       'new' => 'noteDel'],
            //FIXME
            //addComp
            //editComp
            //deleteComp
            //FIXME NEEDS RIGHTS ADDED
        ],
        'FreeRadius'    => [
            ['old' => 'test_radius',     'new' => 'testRadius'],   
        ]                   
    ];

    public function initialize(){
        parent::initialize();
        $this->loadModel('Acos');
        $this->loadModel('ArosAcos');
    }
    
    public function main(){
    
        //First Things First
        $this->_setApAndControllerId();
    
        $this->_rename_acos_entries();
        $this->_clean_up_acos();     
        $this->_addTopUps();
        $this->_addTopUpTransactions();
        $this->_addMisc();
        
        $this->_addApDesk(); 
        
        $this->_addProfilesEdit();   
    }
    
    private function _addMisc(){
        $this->out("Adding Misc Items");   

        $q_a = $this->Acos->find()->where(['alias' => 'DynamicDetails','parent_id' => $this->CntId])->first();
        $dd_id = $q_a->id;

        $q_b = $this->Acos->find()->where(['alias' => 'shufflePhoto','parent_id' => $dd_id])->first();

        if($q_b){
            $this->out("shufflePhoto is already present");
        }else{
            $this->out("$i is NOT present");
            $output = shell_exec("bin/cake acl create aco $dd_id shufflePhoto");
            print($output);
        }
         
        $q_c        = $this->Acos->find()->where(['alias' => 'shufflePhoto','parent_id' => $dd_id ])->first();
        $sp_id      = $q_c->id;
        $aros_id    = $this->aro_ap_id;
        $output     = shell_exec("bin/cake acl grant $aros_id $sp_id");
        print($output);
    }
    
    private function _addTopUps(){
    
        $this->out("Adding Rights for TopUps");
        $this->_addIfMissing('TopUps');
               
        //Now we can loop through the items and see if they are not created
        $tu_methods = [
            'exportCsv',
            'index',
            'add',
            'edit',
            'delete'
        ];
        
        //Get the topups id
        $this->out("Finding the ID of the top-up entry");
        $q_a = $this->Acos->find()->where(['alias' => 'TopUps','parent_id' => $this->CntId])->first();
        $top_up_id = $q_a->id;
        foreach($tu_methods as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $top_up_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $top_up_id $i");
                print($output);
            }
        }
        
        //Set the topup's righs
        foreach($tu_methods as $i){
            $this->out("Setting TopUp right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $top_up_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }    
    }
    
     private function _addTopUpTransactions(){
    
        $this->out("Adding Rights for TopUpTransactions");
        
        $this->_addIfMissing('TopUpTransactions');
        
        //Now we can loop through the items and see if they are not created
        $tu_methods = [        
            'index'
        ];
        
        //Get the topups id
        $this->out("Finding the ID of the top-up entry");
        $q_a = $this->Acos->find()->where(['alias' => 'TopUpTransactions','parent_id' => $this->CntId])->first();
        $top_up_id = $q_a->id;
        foreach($tu_methods as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $top_up_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $top_up_id $i");
                print($output);
            }
        }
        
        //Set the topup's righs
        foreach($tu_methods as $i){
            $this->out("Setting TopUpTransactions right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $top_up_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }    
    }
    
    private function _clean_up_acos(){
        //Somehow the table got littered with junk all having a parent_id of 35
        
        //Confirm id 35 is "Realms"
        $entity = $this->Acos->find()->where(['id' => 35])->first();
        if($entity){
            if($entity->alias == 'Realms'){
                $this->out("Found Junk entity called Realms on ID 35 go on and delete ID 35 related entries");
                $this->Acos->deleteAll(['parent_id' => 35]);
                $this->Acos->deleteAll(['id' => 35]);
            }
        }
        
        //We can also remove some ocos items
        //Vouchers has note_add and note_del double(255 and 256)
        
        $entity = $this->Acos->find()->where(['id' => 255])->first();
        if($entity){
            if($entity->alias == 'note_add'){
                $this->out("Removing double note_add entry");
                $this->Acos->delete($entity);
                $this->ArosAcos->deleteAll(['aco_id' => 255]);
            }
        }
        
        $entity = $this->Acos->find()->where(['id' => 256])->first();
        if($entity){
            if($entity->alias == 'note_del'){
                $this->out("Removing double note_del entry");
                $this->Acos->delete($entity);
                $this->ArosAcos->deleteAll(['aco_id' => 256]);
            }
        }   
    }
    
    private function _rename_acos_entries(){
        $this->hr();
        $this->out("Renaming ACOS entries");
             
        foreach(array_keys($this->acos_entries_rename) as $a){
        
            $this->hr();
            $this->out("Finding the ID of ".$a);
            $this->hr();
            //We put parent id  of 
            $q_a = $this->Acos->find()->where(['alias' => $a,'parent_id' => $this->CntId])->first();
            if($q_a){
                $parent_id = $q_a->id;
                $this->out($a." was found to have an id of ".$parent_id);
                foreach($this->acos_entries_rename[$a] as $b){
                    $old = $b['old'];
                    $new = $b['new'];
                    $q_b = $this->Acos->find()->where(['alias' => $old,'parent_id' => $parent_id])->first();
                    if($q_b){
                        $this->out("Updating $old on $a to $new");
                        $q_b->alias = $new;
                        $this->Acos->save($q_b);
                    }else{
                        $this->out("Could not find $old on $a assume it is already updated");
                    } 
                }
            }
        }   
        $this->hr();
    }
        
    //23Nov 2018 - Add missing rights on ApDesk
    //23Nov 2018 - Add new rights for Notifications
    private function _addApDesk(){
    
        $this->out("Adding Rights for ApDesk");       
        $this->_addIfMissing('ApActions');
        $this->_addAndSetRights('ApActions',['index','add','delete','restartAps']); 
        $this->out("Adding Rights for Alerts");       
        $this->_addIfMissing('NotificationLists');
        $this->_addAndSetRights('NotificationLists',['index','view']); 
    }
    
    private function _addProfilesEdit(){
        $this->_addAndSetRights('Profiles',['edit','simpleView','simpleAdd','simpleEdit']);
        $this->_addAndSetRights('ProfileComponents',['exportCsv']);
        //!!!Sneak another couple in NOV 2019!!!
        $this->_addAndSetRights('Vouchers',['bulkDelete']);
        $this->_addIfMissing('Wizards');
        $this->_addAndSetRights('Wizards',['index']);
        //!!!Sneak in the Hardwares items FEB 2020
        $this->_addIfMissing('Hardwares');
        $this->_addAndSetRights('Hardwares',['index','apProfilesList','meshesList','advancedSettingsForModel','add','edit','view','delete']);
        
        //!!!Sneak in the HomeServerPools DEC 2020
        $this->_addIfMissing('HomeServerPools');
        $this->_addAndSetRights('HomeServerPools',['index','add','edit','delete']);
               
        //!!!Sneak in the OpenvpnServers and TrafficClasses items OCT 2020      
        $this->_addIfMissing('OpenvpnServers');
        $this->_addAndSetRights('OpenvpnServers',['index','add','edit','delete']);
        $this->_addIfMissing('TrafficClasses');
        $this->_addAndSetRights('TrafficClasses',['index','add','edit','delete']);
        $this->_addIfMissing('Clouds');
        $this->_addAndSetRights('Clouds',['index','add','edit','delete']); 
        $this->_addIfMissing('HardwareOwners');
        $this->_addAndSetRights('HardwareOwners',['index','add','edit','delete']);
        
        //!!!Sneak in UnknownNodes Jun 2021
        $this->_addIfMissing('UnknownNodes');
        $this->_addAndSetRights('UnknownNodes',['index','add','edit','delete']);
        
        //!!!Sneak in Schedules and PredefinedCommands September 2021
        $this->_addIfMissing('Schedules');
        $this->_addAndSetRights('Schedules',['indexCombo','index','add','edit','delete','addScheduleEntry','viewScheduleEntry','editScheduleEntry','deleteScheduleEntry']);       
        $this->_addIfMissing('PredefinedCommands');
        $this->_addAndSetRights('PredefinedCommands',['indexCombo','index','add','edit','delete']);                            
    }
    
    private function _setApAndControllerId(){
    
        $q_ap           = $this->Acos->find()->where(['alias' => 'Access Providers'])->first();
        $this->ApId     = $q_ap->id;
        $this->out("AccessProviders id is ".$this->ApId);
        
        $q_ap_c         = $this->Acos->find()->where(['alias' => 'Controllers','parent_id' => $this->ApId])->first();
        $this->CntId    = $q_ap_c->id;
        $this->out("Controllers ID is ".$this->CntId);   
    }
    
    private function _addIfMissing($item){
    
        //Check if it exists perhaps already
        $q_a = $this->Acos->find()->where(['alias' => "$item",'parent_id' => $this->CntId])->first();
        if($q_a){
           $this->out("$item already added it has an ID of ".$q_a->id); 
        
        }else{
            $this->out("$item NOT added YET adding it");
            //$this->dispatchShell("acl create aco 31 TopUps");
            $output = shell_exec("bin/cake acl create aco $this->CntId $item");
            print($output);
        }
    }
    
    private function _addAndSetRights($controller,$rights){
    
         //Get the topups id
        $this->out("Finding the ID of the $controller entry");
        $q_a = $this->Acos->find()->where(['alias' => "$controller",'parent_id' => $this->CntId])->first();
        $c_id = $q_a->id;
        foreach($rights as $i){
            $this->out("Checking and / or adding $i");
            $q_b = $this->Acos->find()->where(['alias' => $i,'parent_id' => $c_id])->first();
            if($q_b){
                $this->out("$i is already present");
            }else{
                $this->out("$i is NOT present");
                $output = shell_exec("bin/cake acl create aco $c_id $i");
                print($output);
            }
        }
        
        //Set the topup's righs
        foreach($rights as $i){
            $this->out("Setting $controller right for $i");
            $q_b        = $this->Acos->find()->where(['alias' => $i,'parent_id' => $c_id])->first();
            $m_id       = $q_b->id;
            $aros_id    = $this->aro_ap_id;
            $output     = shell_exec("bin/cake acl grant $aros_id $m_id");
            print($output);
        }  
    }
    
}
