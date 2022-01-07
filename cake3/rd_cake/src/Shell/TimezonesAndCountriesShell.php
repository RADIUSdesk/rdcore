<?php

//as www-data
//cd /var/www/html/cake3/rd_cake && bin/cake timezones_and_countries

namespace App\Shell;
use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class TimezonesAndCountriesShell extends Shell{

    public function initialize(){
        parent::initialize();
        $this->loadModel('Countries');
        $this->loadModel('Timezones');
    }

    public function main(){
        Configure::load('MESHdesk'); 
 
        $timezones = Configure::read('MESHdesk.timezones');
        $this->out("<info>Populating the Timezones</info>");
        foreach($timezones as $tz){
            $this->out("<info>".$tz['name']."</info>");
            $id     = $tz['id'];
            $name   = $tz['name'];
            $name   = preg_replace('/\s+/', '_', trim($name));
            $value  = $tz['value'];
            $ent = $this->{'Timezones'}->find()->where(['Timezones.id' => $id])->first();
            if(!($ent)){
                $new_ent = $this->{'Timezones'}->newEntity(['id' =>$id,'name' => $name, 'value' => $value]);
                $this->{'Timezones'}->save($new_ent);
            }      
        }
        $this->out("<info>Populating the Countries</info>");
        $countries = Configure::read('MESHdesk.countries');
        foreach($countries as $country){
            $this->out("<info>".$country['name']."</info>");
            $name           = $country['name'];
            $alpha_2_code   = $country['id'];
            $ent = $this->{'Countries'}->find()->where(['Countries.alpha_2_code' => $alpha_2_code])->first();
            if(!($ent)){
                $new_ent = $this->{'Countries'}->newEntity(['name' => $name, 'alpha_2_code' => $alpha_2_code]);
                $this->{'Countries'}->save($new_ent);
            }      
        }
    }  
}

?>
