<?php

namespace App\Controller;

class LanguagesController extends AppController {

    protected $main_model = 'Languages';

    public function initialize(){
       $this->loadModel($this->main_model);

        $this->loadComponent('JsonErrors');
    }

   //--READ--
   public function index() {
        $q = $this->{$this->main_model}->find()->all();
        $items = [];
        foreach($q as $i){
            array_push($items, $i);
        }
        $this->set(array(
            'items' => $items,
            'success' => true,
            '_serialize' => array('items','success')
        ));
    }

    //--READ single--
    public function view($id) {
        $item = $this->{$this->main_model}->find()->where(['Languages.id' => $id])->first();
        $this->set(array(
            'item' => $item,
            'success' => true,
            '_serialize' => array('item','success')
        ));
    }

    //--CREATE--
    public function add() {
       $languageEntity = $this->{$this->main_model}->newEntity($this->request->getData());
        if ($this->{$this->main_model}->save($languageEntity)) {
            $this->set(array(
                'id'        => $languageEntity->id,
                'success'   => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($languageEntity, $message),
                'success' => false,
                '_serialize' => array('errors','success')
            ));
        }   
    }

    //--UPDATE--
    public function edit($id) {
        $languageEditEntity = $this->{$this->main_model}->get($id);
        $this->{$this->main_model}->patchEntity($languageEditEntity, $this->request->getData());

        if ($this->{$this->main_model}->save($languageEditEntity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($languageEditEntity, $message),
                'success' => false,
                '_serialize' => array('errors','success')
            ));
        }
    }

    //--DELETE-- 
    public function delete() {
       $id = $this->request->getData('id');

       $deleteEntity =  $this->{$this->main_model}->get($id);

        if ($this->{$this->main_model}->delete($deleteEntity)) {
            $success = true;
        } else {
            $success = false;
        }

        $this->set(array(
            'success' => $success,
            '_serialize' => array('success')
        ));
    }
}