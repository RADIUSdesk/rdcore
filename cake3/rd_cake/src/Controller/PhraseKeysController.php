<?php

namespace App\Controller;

class PhraseKeysController extends AppController {

    public $main_model = 'PhraseKeys';

    public function initialize()
    {
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

    //--READ--
    public function view($id) {
        $item = $this->{$this->main_model}->find()->where(['PhraseKeys.id' => $id])->first();
        $this->set(array(
            'item' => $item,
            'success' => true,
            '_serialize' => array('item','success')
        ));
    }

    //--CREATE--
    public function add() {
        $svEntity = $this->{$this->main_model}->newEntity($this->request->getData());

        if ($this->{$this->main_model}->save($svEntity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors'    => $this->JsonErrors->entityErros($svEntity, $message),
                'success'   => false,
                'message'   => array('message' => __('Could not create key')),
                '_serialize' => array('errors','success','message')
            ));
        }   
    }

    //--UPDATE--
    public function edit($id) {
        $editEntity = $this->{$this->main_model}->newEntity($this->request->getData());
        $editEntity->id = $id;
        if ($this->{$this->main_model}->save($editEntity)) {
            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($editEntity, $message),
                'success' => false,
                '_serialize' => array('errors','success')
            ));
        }
    }

    //--DELETE-- 
    public function delete($id) {
        $deleteEntity = $this->{$this->main_model}->get($id);

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
