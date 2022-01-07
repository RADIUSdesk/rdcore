<?php

namespace App\Controller;

class CountriesController extends AppController {

    protected $main_model = 'Countries';

    public function initialize(){
        $this->loadModel($this->main_model);

        $this->loadComponent('JsonErrors');
    }

    //--Read (the whole lot)
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

    //--Edit and Create--
    public function add($id = null){ //(Add and edit are one and detected how it has been called)
    //This is a deviation from the standard JSON serialize view since extjs requires a html type reply when files
    //are posted to the server.
//        $this->layout = 'ext_file_upload';
        $this->viewBuilder()->setLayout('ext_file_upload');

        $path_parts     = pathinfo($_FILES['icon']['name']);
        $extension      = $_FILES['icon']['name'];
        $dest           = IMAGES."flags/".$this->request->getData('iso_code').'.'.$path_parts['extension'];
        $dest_www       = "/cake3/rd_cake/webroot/img/flags/".$this->request->getData('iso_code').'.'.$path_parts['extension'];

        //Now add....
        $data['name']       = $this->request->data['name'];
        $data['iso_code']   = $this->request->data['iso_code'];
        $data['icon_file']  = $dest_www;

        if($id == null){
            $fileEntity = $this->{$this->main_model}->newEntity($data);
        } else {
            $fileEntity = $this->{$this->main_model}->newEntity($data);
            $fileEntity->id = $id;
        }
        if($this->{$this->main_model}->save($fileEntity)){

            //Move the file to flags directory:
            move_uploaded_file ($_FILES['icon']['tmp_name'] , $dest);
            //End of file move
            $json_return['id']          = $fileEntity->id;
            $json_return['success']     = true;
        }else{
            $message = 'Error';
            $json_return['errors']      = $this->JsonErrors->entityErros($fileEntity, $message);
            $json_return['message']     = array("message"   => __('Problem adding country'));
            $json_return['success']     = false;
        }
        $this->set('json_return',$json_return);
    }

    //--DELETE-- 
    public function delete() {
        $id = $this->request->getData('id');
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
