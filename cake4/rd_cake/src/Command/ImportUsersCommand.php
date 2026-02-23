<?php
declare(strict_types=1);

namespace App\Command;

use Cake\Console\Arguments;
use Cake\Console\Command;
use Cake\Console\ConsoleIo;
use Cake\ORM\TableRegistry;
use Cake\I18n\FrozenTime;

class ImportUsersCommand extends Command
{
    public function initialize():void{
        parent::initialize();
        $this->PermanentUsers   = $this->getTableLocator()->get('PermanentUsers');
        $this->RealmVlans       = $this->getTableLocator()->get('RealmVlans');
        $this->Realms           = $this->getTableLocator()->get('Realms');
        $this->Profiles         = $this->getTableLocator()->get('Profiles');
      
        $this->Timezones        = $this->getTableLocator()->get('Timezones');
    }
    
    public function execute(Arguments $args, ConsoleIo $io): int
    {
        $csvPath     = $args->getArgument('csv');
        $cloudId     = (int)$args->getArgument('cloud_id');
        $languageId  = $args->getArgument('language_id');
        $countryId   = $args->getArgument('country_id');

        if (!file_exists($csvPath)) {
            $io->err("CSV file not found: $csvPath");
            return Command::CODE_ERROR;
        }


        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            $io->err("Cannot open file.");
            return Command::CODE_ERROR;
        }

        $index = 0;
        $imported = 0;

        while (($row = fgetcsv($handle, 10000, ",")) !== false) {
            if ($index === 0 && strtolower(trim($row[0])) === 'username') {
                $index++;
                continue;
            }
            $row_data = $this->_testCsvRow($row);
            if ($row_data) {
                $row_data['cloud_id']    = $cloudId;
                $row_data['language_id'] = $languageId;
                $row_data['country_id']  = $countryId;
                $row_data['active']      = 1;
                
                //Some blank default values
                $row_data['address']    = '';
                $row_data['phone']      = '';
                $row_data['email']      = '';
                
                $row_data['token']      = ''; //Feb 2026 set it to nothing to trigger a new token creation
              
                $entity = $this->PermanentUsers->newEntity($row_data);

                if ($entity->getErrors()) {
                    $this->logFailure(
                        $cloudId,
                        'PermanentUsers',
                        $index,
                        $row_data['username'] ?? null,
                        'validation',
                        json_encode($entity->getErrors()),
                        $row_data
                    );
                    $index++;
                    continue;
                }
                
                try {
                    if (!$this->PermanentUsers->save($entity)) {
                        throw new \RuntimeException('Save returned false');
                    }else{
                        if (!empty($row_data['auto_mac'])) {
                            $this->PermanentUsers->setAutoMac($entity->username, true);
                        }
                        $imported++;
                    }                      
                } catch (\Throwable $e) {
                    $this->logFailure(
                        $cloudId,
                        'PermanentUsers',
                        $index,
                        $row_data['username'] ?? null,
                        'exception',
                        $e->getMessage(),
                        $row_data
                    );
                    $index++;
                    continue;
                }
                $index++;            
                
            }

            if ($index % 1000 === 0) {
                $io->out("Processed $index rows...");
            }
        }

        fclose($handle);
        $io->out("Done. Imported: $imported of $index");
        unlink($csvPath);
        return Command::CODE_SUCCESS;
    }

    public function buildOptionParser(\Cake\Console\ConsoleOptionParser $parser): \Cake\Console\ConsoleOptionParser
    {
        return $parser
            ->addArgument('csv', ['help' => 'CSV path'])
            ->addArgument('cloud_id', ['help' => 'Cloud ID'])
            ->addArgument('language_id', ['help' => 'Language ID'])
            ->addArgument('country_id', ['help' => 'Country ID']);
    }
    
     private function _testCsvRow(array $row){

        if (empty($row[0]) || strlen($row[0]) < 2) {
            return false; // Invalid username
        }

        if (empty($row[1]) || strlen($row[1]) < 4) {
            return false; // Invalid password
        }

        [$username, $password, $realm, $profile, $name, $surname, $static_ip, $site, $ppsk, $vlan, $extra_name, $extra_value, $auto_mac,$mac_address,$from_date,$to_date] = array_pad($row, 16, null);

        $row_data = [
            'username' => $username,
            'password' => $password,
            'name'     => $name,
            'surname'  => $surname,
            'site'     => $site,
            'auto_mac' => ($auto_mac === 'true')
        ];

        // Realm processing
        if (!empty($realm)) {
            $realm_entity = $this->Realms->entityBasedOnPost(['realm' => $realm]);
            if (!$realm_entity) {
                return false;
            }

            $row_data['realm']    = $realm_entity->name;
            $row_data['realm_id'] = $realm_entity->id;

            if (filter_var($username, FILTER_VALIDATE_EMAIL)) {
                $row_data['email'] = $username;
            }

            if (!empty($realm_entity->suffix) && $realm_entity->suffix_permanent_users) {
                $row_data['username'] .= '@' . $realm_entity->suffix;
            }
        }

        // Profile processing
        if (!empty($profile)) {
            $profile_entity = $this->Profiles->entityBasedOnPost(['profile' => $profile]);
            if (!$profile_entity) {
                return false;
            }

            $row_data['profile']    = $profile_entity->name;
            $row_data['profile_id'] = $profile_entity->id;
        }

        // Static IP validation
        if (!empty($static_ip)) {
            if (!filter_var($static_ip, FILTER_VALIDATE_IP)) {
                return false;
            }
            $row_data['static_ip'] = $static_ip;
        }

        // PPSK
        if (!empty($ppsk) && strlen($ppsk) >= 8) {
            $row_data['ppsk'] = $ppsk;
        }

        // VLAN processing
        if (!empty($vlan)) {
            if ($vlan === 'next_available') {
                $r_vlans = $this->RealmVlans->find()
                    ->where(['RealmVlans.realm_id' => $row_data['realm_id']])
                    ->contain(['PermanentUsers'])
                    ->order(['vlan' => 'ASC'])
                    ->all();

                foreach ($r_vlans as $v) {
                    if (empty($v->permanent_users)) {
                        $row_data['realm_vlan_id'] = $v->id;
                        break;
                    }
                }

                if (empty($row_data['realm_vlan_id'])) {
                    return false;
                }
            } elseif (is_numeric($vlan)) {
                $r_vlan = $this->RealmVlans->find()
                    ->where([
                        'RealmVlans.realm_id' => $row_data['realm_id'],
                        'RealmVlans.vlan'     => $vlan
                    ])
                    ->first();

                if (!$r_vlan) {
                    return false;
                }

                $row_data['realm_vlan_id'] = $r_vlan->id;
            }
        }

        // Optional extra fields
        if (isset($extra_name)) {
            $row_data['extra_name'] = $extra_name;
        }

        if (isset($extra_value)) {
            $row_data['extra_value'] = $extra_value;
        }
        
        //--FEB 2026 -- mac_address, from_date and to_date
        if (isset($mac_address)) {
            $row_data['mac_address'] = $mac_address;
        }

        if (isset($from_date)) {
            if($from_date === 'now'){ //Special keyword for API
                $row_data['from_date'] = FrozenTime::now()->startOfDay();
            }else{
                $from = new FrozenTime($from_date);
                $from = $from->startOfDay();         
                $row_data['from_date'] = $from;
            }           
        }
        
        if (isset($to_date)) {
            if (filter_var($to_date, FILTER_VALIDATE_INT) !== false && $to_date < 100) {
                $to = FrozenTime::now()->endOfDay();
                $to = $to->addDay(($to_date*30));               
                $row_data['to_date'] = $to;
            }else{
                $to = new FrozenTime($to_date);
                $to = $to->endOfDay();    
                $row_data['to_date'] = $to;
            }
        }
        //-- END FEB 2026 ---                
        return $row_data;
    }
    
    private function logFailure(
        int $cloudId,
        string $model,
        int $rowNumber,
        ?string $identifier,
        string $type,
        string $message,
        array $payload = []
    ): void {
        $failures = $this->fetchTable('ImportFailures');
        $entity = $failures->newEntity([
            'cloud_id'     => $cloudId,
            'model'        => $model,
            'csv_row'      => $rowNumber,
            'identifier'   => $identifier,
            'error_type'   => $type,
            'error_message'=> $message,
            'payload'      => json_encode($payload),
        ]);

        $failures->save($entity);
    }

}
