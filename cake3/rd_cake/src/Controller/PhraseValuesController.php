<?php

namespace App\Controller;

use Cake\Core\Configure;

class PhraseValuesController extends AppController {

    //Replace later with config values
    public $engCountry_iso  = 'GB';
    public $engLanguage_iso = 'en';

    public function initialize()
    {
        $this->loadModel('PhraseValues');

        $this->loadComponent('JsonErrors');

    }

    //Used to 'prime' the application with all the localized strings
    function getLanguageStrings(){

        $cquery = $this->request->getQuery();

        if((isset($cquery['language'])) && ($cquery['language'] != '')){
            $selLanguage = $cquery['language'];
        }else{
            $selLanguage = Configure::read('language.default'); //Get the default language from the config file
        };

        $languages  = $this->PhraseValues->list_languages();                 //Give a list of available languages
        $phrases    = $this->PhraseValues->getLanguageStrings($selLanguage); //We get all the phrases for the selected language
        //--- Language related --------

        $this->set(array(
            'data' => array(
                'phrases'       => $phrases,
                'languages'     => $languages,
                'selLanguage'   => $selLanguage
            ),
            'success'       => true,
            '_serialize' => array('data','success')
        ));

    }

    public function lLanguages(){

        //We must see if we were called with a certain language in mind / if not give default
        $cquery = $this->request->getQuery();

        if((isset($cquery['language'])) && ($cquery['language'] != '')){
            $selLanguage = $cquery['language'];
        }else{
            $selLanguage = '1_1';
        };
        $languages  = $this->PhraseValues->list_languages();
        $this->set(array(
            'items'     => $languages,
            'selLanguage'   => $selLanguage,
            'success'       => true,
            '_serialize' => array('items','selLanguage','success')
        ));
    }

    function addLanguage(){
        $cdata = $this->request->getData();
        //See if we do not already have this language present
        $l_name = $cdata['name'];
        $l_iso  = $cdata['iso_code'];

        $q_r = $this->PhraseValues->Languages->find()->where([
            'Languages.name' => $l_name,
            'Languages.iso_code' => $l_iso
        ])->first();

        $new_lang_id = false;

        $phEntity = $this->PhraseValues->Languages->newEntity($cdata);

        if($q_r){
           $new_lang_id = $q_r->id;
        }else{
            if ($this->PhraseValues->Languages->save($phEntity)) {
                $new_lang_id = $phEntity->id;
            }
        }

        if ($new_lang_id != false) {

            //Now we need to add phrases for this
            $country_id  = $this->request->getData('country_id');

            //Get the country's name
            $c      = $this->PhraseValues->Countries->find()->where(['Countries.id' => $country_id])->first();

            $c_name = $c->name;
            $c_iso  = $c->iso_code;

            //Get tha language's name
            $l      = $this->PhraseValues->Languages->find()->where(['Languages.id' => $new_lang_id])->first();

            $l_name = $l->name;
            $l_iso  = $l->iso_code;

            $q = $this->PhraseValues->PhraseKeys->find()->all();
            foreach($q as $i){
                $key_id     = $i->id;
                $key_name   = $i->name;
                $phrase     = '(modify me)';
                if($key_name == 'spclCountry'){
                    $phrase = $c_name;
                }
                if($key_name == 'spclLanguage'){
                    $phrase = $l_name;
                }
                $this->PhraseValue->create();

                $phsEntity = $this->PhraseValues->newEntity([
                    'name'              => $phrase,
                    'phrase_key_id'     => $key_id,
                    'country_id'        => $country_id,
                    'language_id'       => $new_lang_id
                ]);

                $this->PhraseValue->save($phsEntity);
            }

            //Check if the yfi_cake/Locale/$l_iso _ $c_iso/LC_MESSAGES/default.po file exists; if not create and copy
            $locale     = "$l_iso".'_'."$c_iso";
            $file       = APP."Locale/$locale/LC_MESSAGES/default.po";
            $source     = APP."Locale/en_GB/LC_MESSAGES/default.po";
            if(!file_exists($file)){
                $dir    = APP."Locale/$locale/LC_MESSAGES";
                if(!is_dir($dir)){
                    mkdir($dir, 0755, true);
                    copy($source,$file);
                }
            }

            $this->set(array(
                'success' => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($phEntity, $message),
                'success' => false,
                '_serialize' => array('errors','success')
            ));
        }
    }

    function addKey(){
        $cdata = $this->request->getData();
        $keyEntity = $this->PhraseValues->PhraseKeys->newEntity($cdata);

        if ($this->PhraseValues->PhraseKeys->save($keyEntity)) {
            //Add this key to each distinct Country / Language combination in the PhraseValues table
            $new_key_id = $keyEntity->id;

            $q = $this->PhraseValues->find()->select(['PhraseValues.language_id', 'PhraseValues.country_id'])
                                    ->distinct(['PhraseValues.language_id', 'PhraseValues.country_id'])
                                    ->all();

            foreach($q as $i){

                $phEntity = $this->PhraseValues->newEntity([
                    'name'              => "(new addition)",
                    'phrase_key_id'     => $new_key_id,
                    'country_id'        => $i->country_id,
                    'language_id'       => $i->language_id
                ]);

                $this->PhraseValues->save($phEntity);
            }
            //Reply
            $this->set(array(
                'id'        => $new_key_id,
                'success'   => true,
                '_serialize' => array('success')
            ));
        } else {
            $message = 'Error';
            $this->set(array(
                'errors' => $this->JsonErrors->entityErros($keyEntity, $message),
                'success' => false,
                'message'   => array('message' => __('Could not create key')),
                '_serialize' => array('errors','success','message')
            ));
        }
    }

    function listPhrasesFor(){

        $cquery = $this->request->getQuery();

        if((array_key_exists('language', $cquery)) && ($cquery['language'] != '')){
            $language = $cquery['language'];
        }else{
            //Simply return empty since nothing is selected
            $this->set(array(
                'items'         => array(),
                'success'       => true,
            '_serialize' => array('items','success')
            ));
            return; 
        }

        $eng_flag = false;

        $eng_country    = $this->PhraseValues->Countries->find()->where(['Countries.iso_code' => $this->engCountry_iso])->first();

        $eng_country    = $eng_country->id;

        $eng_language   = $this->PhraseValues->Languages->find()->where(['Languages.iso_code' => $this->engLanguage_iso])->first();

        $eng_language   = $eng_language->id;

        
        $country_language   = explode( '_', $language );
        $country            = $country_language[0];
        $language           = $country_language[1];

        //Check if english default is selected
        if(($eng_language == $language)&&($eng_country == $country)){
            $eng_flag = true;
        }
        //Depending if English default is selected or another language we will behave differently
        if($eng_flag == true){
            $q = $this->PhraseValues->PhraseKeys->find()->where([
                'PhraseValues.country_id'  => "$eng_country",
                'PhraseValues.language_id' => "$eng_language",
            ])->all();
        }else{
            $q = $this->PhraseValues->PhraseKeys->find('all', array(
                'contain' => array(
                    'PhraseValues' => array(
                        'conditions' => array(
                            'OR' =>array(
                                array(
                                    'AND' => array(
                                        'PhraseValues.country_id'  => "$eng_country",
                                        'PhraseValues.language_id' => "$eng_language"
                                    )
                                ),
                                array(
                                    'AND' => array(
                                        'PhraseValues.country_id'  => "$country",
                                        'PhraseValues.language_id' => "$language"
                                    )
                                )
                            )
                            
                        )
                    )
            )));
        }

        $return_items = [];
        //Loop through them and make sure there are PhraseValue's for each one for this language
        $phrase_flag = false; //Test to see if there are a phrase for this key in this language
        foreach($q as $item){
            $key_name       = $item['PhraseKey']['name'];
            $key_comment    = $item['PhraseKey']['comment'];
            $key_id         = $item['PhraseKey']['id'];
            $phrase_id      = false;
            $eng_phrase     = '';
            $trans_phrase   = '';
            foreach($item['PhraseValue'] as $pv){
                $l_id   = $pv['language_id'];
                $c_id   = $pv['country_id'];
                if($eng_flag == true){
                    $phrase_id      = $pv['id'];
                    $eng_phrase     = $pv['name'];
                    $trans_phrase   = $pv['name'];
                }else{
                    if(($l_id == $eng_language)&&($c_id == $eng_country)){
                        $eng_phrase = $pv['name'];
                    }
                    if(($l_id == $language)&&($c_id == $country)){
                        $trans_phrase   = $pv['name'];
                        $phrase_id      = $pv['id'];
                    }
                }
            }

            //FIXME
            if($phrase_id == false){
                //Add a blank phrase for this key for this language
                print("Blank value");
            }else{
                //push to array and clear the blank flag
                array_push($return_items, 
                    array(  'id'        => $phrase_id,  'key'       => $key_name,
                            'comment'   => $key_comment, 'english'  => $eng_phrase,
                            'translated'=> $trans_phrase, 'key_id'  => $key_id
                     ));
                $phrase_id = false;  
            }
        }

        $this->set(array(
            'items'         => $return_items,
            'success'       => true,
            '_serialize' => array('items','success')
        )); 
    }

    function updatePhrase($id){
        $cdata = $this->request->getData();

        $success = true;
        $data = array('id' => $cdata['id'], 'name' => $cdata['translated']);

        $pvEntity = $this->PhraseValues->newEntity($data);

        if($this->PhraseValues->save($pvEntity) == false){
            $success = false;
        }
        $this->set(array(
            'success'       => $success,
            '_serialize' => array('success')
        ));
    }

    function copyPhrases(){
        $this->PhraseValues->copy_phrases($this->request->getData());
        $this->set(array(
            'data'          => $this->data,
            'success'       => true,
            '_serialize' => array('data','success')
        ));
    }

    //TODO get a easy way for definign the default language
    function listLanguages(){
        //We must see if we were called with a certain language in mind / if not give default
        $cquery = $this->request->getQuery();

        if((isset($cquery['language'])) && ($cquery['language'] != '')){
            $selLanguage = $cquery['language'];
        }else{
            $selLanguage = Configure::read('language.default'); //Get the default language from the config file
        };

        $languages  = $this->PhraseValues->list_languages();
        $phrases    = $this->PhraseValues->getLanguageStrings($selLanguage);

        $this->set(array(
            'phrases'       => $phrases,
            'languages'     => $languages,
            'selLanguage'   => $selLanguage,
            'success'       => true,
            '_serialize' => array('phrases','languages','selLanguage','success')
        ));
    }

    //This will give the id of a phrase_value. We need to get the phrase key id for that value and delete all the entries of that thing
    public function deleteKeys($id){

        $success = false;
        $q = $this->PhraseValues->find()->where(['PhraseValues.id' => $id])->first();

        if(isset($q->phrase_key_id)){
            $key_id = $q->phrase_key_id;

            $keyEntity = $this->PhraseValues->PhraseKeys->get($key_id);

            if ($this->PhraseValues->PhraseKeys->delete($keyEntity)) {
                $success = true;
            } else {
                $success = false;
            }
        }

        $this->set(array(
            'success' => $success,
            '_serialize' => array('success')
        ));
    }
}
