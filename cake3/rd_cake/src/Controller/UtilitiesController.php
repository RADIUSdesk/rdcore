<?php
/**
 * Created by G-edit.
 * User: dirkvanderwalt
 * Date: 02/06/2020
 * Time: 00:00
 */

namespace App\Controller;

class UtilitiesController extends AppController {

    public function initialize(){
        parent::initialize();
        $this->loadModel('Countries');
        $this->loadModel('Timezones');
        $this->loadComponent('Aa');
    }
    
    public function timezonesIndex(){   
        $items      = [];
        $results    = $this->{'Timezones'}->find()->all();        
        foreach($results as $ent){
            array_push($items,['id' => $ent->id ,'name'=> $ent->name, 'value'=> $ent->value]);       
        }
        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]); 
    }
    
    public function countriesIndex(){

        $items      = [];
        $results    = $this->{'Countries'}->find()->all();
           
        foreach($results as $ent){
            array_push($items,['id' => $ent->alpha_2_code ,'name'=> $ent->name]);       
        }
          
        $this->set([
            'items'         => $items,
            'success'       => true,
            '_serialize'    => ['items','success']
        ]);    
    }
    
   
}
