<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Validation\Validator;

class PhraseValuesTable extends Table {

    public function initialize(array $config)
    {
        parent::initialize();

        $this->hasMany('PhraseKeys', ['dependent' => true]);
        $this->hasMany('Countries', ['dependent' => true]);
        $this->hasMany('Languages', ['dependent' => true]);
    }

    public function validationDefault(Validator $validator)
    {
        $validator = new Validator();
        $validator->notBlank('name','Value is required');

        return $validator;
    }

    public function getLanguageStrings($language = '1'){

        $country_language   = explode( '_', $language );
        $country            = $country_language[0];
        $language           = $country_language[1];

        $q = $this->find()->contain(['PhraseKeys'])->all();

        $language_strings   = [];

        foreach($q as $i){
            foreach($i as $j){
                if(($j->country_id == $country) && ($j->language_id == $language)){
                    $language_strings[$i->phrase_keys->name] = $j->name;
                    break; //Once we have our phrase we don't care for the rest
                }
            }
        }
        return $language_strings;
    }

    public function getLanguageForString($language, $string){

        $country_language   = explode( '_', $language );
        $country            = $country_language[0];
        $language           = $country_language[1];

        $q                  =   $this->find()->where([
            'PhraseValues.country_id'    => $country,
            'PhraseValues.language_id'         => $language,
            'PhraseKeys.name'                  => $string
        ])->first();

        $string = $q->name;

        return $string;
    }

    function list_languages(){
        $q = $this->find()->select(['PhraseValues.language_id', 'PhraseValues.country_id','Countries.icon_file','Languages.rtl'])
                          ->distinct(['PhraseValues.language_id', 'PhraseValues.country_id','Countries.icon_file','Languages.rtl'])
                          ->all();

        $languages = [];

        foreach($q as $i){
            $l_id       = $i->country_id.'_'.$i->language_id;
            $country    = $this->getLanguageForString($l_id,'spclCountry');
            $language   = $this->getLanguageForString($l_id,'spclLanguage');
            $icon_file  = $i->country->icon_file;
            array_push($languages,
                array(  'id'        => $l_id,
                        'country'   => $country, 
                        'language'  => $language,
                        'text'      => "$country -> $language",
                        'rtl'       => $i->language->rtl,
                        'icon_file' => $icon_file)
            );   
        }
        return $languages;
    }

    function copy_phrases($data){
        $s_language = $data['source_id'];
        $d_language = $data['destination_id'];

        $s_country_language   = explode( '_', $s_language );
        $s_country            = $s_country_language[0];
        $s_language           = $s_country_language[1];

        $d_country_language   = explode( '_', $d_language );
        $d_country            = $d_country_language[0];
        $d_language           = $d_country_language[1];

        $q_s = $this->find()->contain(['Countries'])->where([
            'PhraseValues.country_id' => $s_country,
            'PhraseValues.language_id' => $s_language
        ])->all();

        foreach($q_s as $i){
            //Find the item for the destination language and replace the name field
            $phrase_key = $i->phrase_key_id;
            $phrase_val = $i->name;

            $q_d = $this->find()->where([
                'PhraseValues.country_id'    => $d_country,
                'PhraseValues.language_id'   => $d_language,
                'PhraseValues.phrase_key_id' => $phrase_key
            ])->first();

            $q_d->name = $phrase_val;
            $this->id = $q_d->id;

            $phEntity = $this->newEntity($q_d);

            $this->save($phEntity);
        }
    }

}