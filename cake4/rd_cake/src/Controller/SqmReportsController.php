<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 29/July/2024
 * Time: 00:00
 */

namespace App\Controller;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;
use Cake\I18n\FrozenTime;

class SqmReportsController extends AppController {

    protected $main_model   = 'SqmReports';
    
    public function initialize():void{
        parent::initialize();
        
        $this->loadModel($this->main_model);
        $this->loadComponent('CommonQueryFlat', [ //Very important to specify the Model
            'model'     => 'SqmReports',
            'sort_by'   => 'SqmProfiles.created'
        ]);
        
        $this->loadComponent('Aa');
        $this->loadComponent('JsonErrors');
    }
                   
  	public function indexDataView(){
        //__ Authentication + Authorization __
        $user = $this->_ap_right_check();
        if (!$user) {
            return;
        }
   
        //___ FINAL PART ___
        $this->set([
            'items'         => [],
            'success'       => true,
            'totalCount'    => 0
        ]);
        $this->viewBuilder()->setOption('serialize', true);
    }
        
}


