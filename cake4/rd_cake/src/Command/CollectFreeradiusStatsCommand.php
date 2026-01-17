<?php

//as www-data
//cd /var/www/rdcore/cake4/rd_cake && bin/cake freeradius:collect-stats >> /dev/null 2>&1

declare(strict_types=1);

namespace App\Command;

use Cake\Console\Arguments;
use Cake\Console\Command;
use Cake\Console\ConsoleIo;
use Cake\ORM\TableRegistry;
use Cake\I18n\FrozenTime;

class CollectFreeradiusStatsCommand extends Command
{
    protected const DEFAULT_TIMEOUT = 7; // seconds

    public static function defaultName(): string
    {
        return 'freeradius:collect-stats';
    }

    public function execute(Arguments $args, ConsoleIo $io)
    {
        $server  = $args->getOption('server') ?? '127.0.0.1';
        $port    = (string)($args->getOption('port') ?? '18121');
        $secret  = $args->getOption('secret') ?? 'adminsecret';
        $attrs   = $args->getOption('attrs') ?? '/var/www/rdcore/cake4/rd_cake/config/status-all.txt';
        $tag     = $args->getOption('tag') ?? 'main';
        $timeout = (int)($args->getOption('timeout') ?? self::DEFAULT_TIMEOUT);

        $bin = trim((string)($args->getOption('radclient') ?? 'radclient'));

        $serverAddr = "{$server}:{$port}";
        $cmd = sprintf(
            'timeout %d %s -x %s status %s < %s 2>&1',
            $timeout,
            escapeshellcmd($bin),
            escapeshellarg($serverAddr),
            escapeshellarg($secret),
            escapeshellarg($attrs)
        );

        $io->out("Running: $cmd");
        $output = shell_exec($cmd) ?? '';
        if ($output === '') {
            $io->err('No output from radclient');
            return self::CODE_ERROR;
        }

        // Parse lines "Key = value" and map only Accounting + USTH
        $lines = preg_split('/\R/u', $output);
        $kv = [];
        foreach ($lines as $line) {
            // E.g.: " FreeRADIUS-Total-Accounting-Requests = 36"
            if (preg_match('/^\s*([A-Za-z0-9\-]+)\s*=\s*(.+)\s*$/', $line, $m)) {
                $key = $m[1];
                $val = trim($m[2], '" ');
                $kv[$key] = $val;
            }
        }

        $mapInt = function($key) use ($kv): ?int {
            if (!array_key_exists($key, $kv)) return null;
            $v = $kv[$key];
            if (preg_match('/^-?\d+$/', $v)) return (int)$v;
            return null;
        };

        $parseFrTime = function($key) use ($kv): ?FrozenTime {
            if (empty($kv[$key])) return null;
            // Example: "Oct 26 2025 19:29:33 UTC"
            $dt = \DateTime::createFromFormat('M d Y H:i:s T', $kv[$key], new \DateTimeZone('UTC'));
            if (!$dt) return null;
            return FrozenTime::createFromTimestamp($dt->getTimestamp())->setTimezone('UTC');
        };

        $entityData = [
            'tag'                     => $tag,
            'server'                  => $serverAddr,
            'stats_start_time'        => $parseFrTime('FreeRADIUS-Stats-Start-Time'),
            'stats_hup_time'          => $parseFrTime('FreeRADIUS-Stats-HUP-Time'),
            
            // Auth totals
            'total_access_requests'   => $mapInt('FreeRADIUS-Total-Access-Requests'),
            'total_access_accepts'    => $mapInt('FreeRADIUS-Total-Access-Accepts'),
            'total_access_rejects'    => $mapInt('FreeRADIUS-Total-Access-Rejects'),
            'total_access_challenges' => $mapInt('FreeRADIUS-Total-Access-Challenges'),
            'total_auth_responses'    => $mapInt('FreeRADIUS-Total-Auth-Responses'),
            'auth_duplicate_requests' => $mapInt('FreeRADIUS-Total-Auth-Duplicate-Requests'),
            'auth_malformed_requests' => $mapInt('FreeRADIUS-Total-Auth-Malformed-Requests'),
            'auth_invalid_requests'   => $mapInt('FreeRADIUS-Total-Auth-Invalid-Requests'),
            'auth_dropped_requests'   => $mapInt('FreeRADIUS-Total-Auth-Dropped-Requests'),
            'auth_unknown_types'      => $mapInt('FreeRADIUS-Total-Auth-Unknown-Types'),
            'auth_conflicts'          => $mapInt('FreeRADIUS-Total-Auth-Conflicts'),         

            // Accounting totals
            'total_acct_requests'     => $mapInt('FreeRADIUS-Total-Accounting-Requests'),
            'total_acct_responses'    => $mapInt('FreeRADIUS-Total-Accounting-Responses'),
            'acct_duplicate_requests' => $mapInt('FreeRADIUS-Total-Acct-Duplicate-Requests'),
            'acct_malformed_requests' => $mapInt('FreeRADIUS-Total-Acct-Malformed-Requests'),
            'acct_invalid_requests'   => $mapInt('FreeRADIUS-Total-Acct-Invalid-Requests'),
            'acct_dropped_requests'   => $mapInt('FreeRADIUS-Total-Acct-Dropped-Requests'),
            'acct_unknown_types'      => $mapInt('FreeRADIUS-Total-Acct-Unknown-Types'),
            'acct_conflicts'          => $mapInt('FreeRADIUS-Total-Acct-Conflicts'),

            // USTH
            'queue_len_internal'      => $mapInt('FreeRADIUS-Queue-Len-Internal'),
            'queue_len_proxy'         => $mapInt('FreeRADIUS-Queue-Len-Proxy'),
            'queue_len_auth'          => $mapInt('FreeRADIUS-Queue-Len-Auth'),
            'queue_len_acct'          => $mapInt('FreeRADIUS-Queue-Len-Acct'),
            'queue_len_detail'        => $mapInt('FreeRADIUS-Queue-Len-Detail'),
            'queue_pps_in'            => $mapInt('FreeRADIUS-Queue-PPS-In'),
            'queue_pps_out'           => $mapInt('FreeRADIUS-Queue-PPS-Out'),
            'threads_active'          => $mapInt('FreeRADIUS-Stats-Threads-Active'),
            'threads_total'           => $mapInt('FreeRADIUS-Stats-Threads-Total'),
            'threads_max'             => $mapInt('FreeRADIUS-Stats-Threads-Max'),
        ];

        // Insert
        /** @var \App\Model\Table\FreeradiusStatsTable $Stats */
        print_r($entityData);

        $Instance = TableRegistry::getTableLocator()->get('FreeradiusInstances');
        
        //--See if there are existing one
        $entity = $Instance->find()->where([
                'stats_start_time'  => $entityData['stats_start_time'],
                'tag'               => $entityData['tag'],
                'server'            => $entityData['server']            
            ])->first();
            
        if($entity){
            $io->success('Found Existing Entry - Updating it : row id ' . $entity->id);
            $entity->modified = FrozenTime::now();
            $entity->setDirty('modified', true);
            
            print_r($entityData);
            print_r($entity);
            
            $deltas = [
                'access_requests' =>
                    max(0, $entityData['total_access_requests'] - ($entity->total_access_requests ?? 0)),

                'access_accepts' =>
                    max(0, $entityData['total_access_accepts'] - ($entity->total_access_accepts ?? 0)),

                'access_rejects' =>
                    max(0, $entityData['total_access_rejects'] - ($entity->total_access_rejects ?? 0)),

                'access_challenges' =>
                    max(0, $entityData['total_access_challenges'] - ($entity->total_access_challenges ?? 0)),

                'auth_responses' =>
                    max(0, $entityData['total_auth_responses'] - ($entity->total_auth_responses ?? 0)),

                'acct_requests' =>
                    max(0, $entityData['total_acct_requests'] - ($entity->total_acct_requests ?? 0)),

                'acct_responses' =>
                    max(0, $entityData['total_acct_responses'] - ($entity->total_acct_responses ?? 0)),
            ];          
            
            if (array_sum($deltas) > 0) {
                print_r($deltas);
                $io->success('== Changes detected - Record the Deltas ===');
                //-- Stats Entry --
                $Stat           = TableRegistry::getTableLocator()->get('FreeradiusStats');
                $deltas['tag']  = $entityData['tag'];               
                $e_stat         = $Stat->newEntity($deltas);
                $Stat->save($e_stat);            
            }                     
            $Instance->patchEntity($entity,$entityData);       
        }else{
            $entity = $Instance->newEntity($entityData);
            
            //-- Stats Entry --
            $Stat   = TableRegistry::getTableLocator()->get('FreeradiusStats');
            $s_data = [
                'tag'               => $entityData['tag'],
                'access_requests'   => $entityData['total_access_requests'],
                'access_accepts'    => $entityData['total_access_accepts'],
                'access_rejects'    => $entityData['total_access_rejects'],
                'access_challenges' => $entityData['total_access_challenges'],
                'auth_responses'    => $entityData['total_auth_responses'],
                'acct_requests'     => $entityData['total_acct_requests'],
                'acct_responses'    => $entityData['total_acct_responses']        
            ];
            $e_stat = $Stat->newEntity($s_data);
            $Stat->save($e_stat); 
                     
        }
        
        if ($entity->getErrors()) {
            $io->err('Validation errors: ' . json_encode($entity->getErrors(), JSON_PRETTY_PRINT));
            return self::CODE_ERROR;
        }
        if (!$Instance->save($entity)) {
            $io->err('Failed saving freeradius_instances row.');
            return self::CODE_ERROR;
        }

        $io->success('OK: row id ' . $entity->id);
        return self::CODE_SUCCESS;
    }

    protected function buildOptionParser(\Cake\Console\ConsoleOptionParser $parser): \Cake\Console\ConsoleOptionParser
    {
        $parser = parent::buildOptionParser($parser);
        $parser->addOptions([
            'server'   => ['help' => 'Status server IP/host', 'short' => 's'],
            'port'     => ['help' => 'Status server port', 'short' => 'p'],
            'secret'   => ['help' => 'Shared secret', 'short' => 'e'],
            'attrs'    => ['help' => 'Attributes file path', 'short' => 'a'],
            'tag'      => ['help' => 'Tag for this node (cloud/role/hostname)', 'short' => 't'],
            'timeout'  => ['help' => 'Command timeout (seconds)', 'short' => 'i'],
            'radclient'=> ['help' => 'Path to radclient binary', 'short' => 'c'],
        ]);
        return $parser;
    }
}
