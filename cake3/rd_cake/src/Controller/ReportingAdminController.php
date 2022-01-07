<?php
/*
 * Dirk 23DEC 2020
*/

namespace App\Controller;
use App\Controller\AppController;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class ReportingAdminController extends AppController{
  
    protected $main_model   = 'TempReports';
  
    public function initialize(){  
        parent::initialize();
        $this->loadModel('TempReports');              
        $this->loadComponent('JsonErrors'); 
        $this->loadComponent('TimeCalculations');        
    }
    
	public function listAwaitingCount(){
	
	    $data = [];
	    
	    $count = $this->{$this->main_model}->find()->count();
	    $data['requested']  = "Awaiting Item Count";
	    $data['value']      = $count; 
	
		$this->set(array(
            'success'   => true,
            'data'      => $data,
            '_serialize' => array('success','data')
        ));
	}
	
	public function clearAwaiting(){
	
	    $data       = [];    
	    $count_a  = $this->{$this->main_model}->find()->count();    
	    $this->{$this->main_model}->deleteAll([]);   
	    $count_b  = $this->{$this->main_model}->find()->count();
	    
	    $data['before_delete']  = $count_a;
	    $data['after_delete']   = $count_b; 
	
		$this->set(array(
            'success'   => true,
            'data'      => $data,
            '_serialize' => array('success','data')
        ));
	}
	
}
?>
