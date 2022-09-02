<?php

namespace App\Controller;
use App\Controller\AppController;

class TestsController extends AppController{
  
    public $base         = "Access Providers/Controllers/TopUpTransactions/";   
    protected $owner_tree   = array();
    protected $main_model   = 'TopUpTransactions';
  
    public function initialize():void{  
        parent::initialize();
           
    }
      
    public function index(){
    
    	$this->set(['posts' => true]);
		$this->viewBuilder()->setOption('serialize', true);
      
    }
}
