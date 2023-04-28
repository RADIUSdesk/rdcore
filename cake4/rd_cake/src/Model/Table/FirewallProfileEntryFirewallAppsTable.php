<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class FirewallProfileEntryFirewallAppsTable extends Table {

    public function initialize(array $config):void{
    
        $this->addBehavior('Timestamp');
    
        $this->belongsTo('FirewallProfileEntries', [
                'className' => 'FirewallProfileEntries',
                'foreignKey' => 'firewall_profile_entry_id'
            ]);
        $this->belongsTo('FirewallApps', [
                'className' => 'FirewallApps',
                'foreignKey' => 'firewall_app_id'
            ]);
    }
}
