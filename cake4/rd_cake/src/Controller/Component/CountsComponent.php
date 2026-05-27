<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to return totals of Items based on the CloudId
//---- Date: 12-OCT-2025
//------------------------------------------------------------
declare(strict_types=1);

namespace App\Controller\Component;

use Cake\Controller\Component;
use Cake\Controller\ComponentRegistry; 

use Cake\Cache\Cache;

use Cake\ORM\Table;
use Cake\ORM\TableRegistry;
use Cake\I18n\FrozenTime;

class CountsComponent extends Component {

    protected $components 	= ['Aa'];
    protected $dead_after   = 900; //Default
    
    protected $_defaultConfig = [
        // Multi-tenant defaults
        'cloudField'     => 'cloud_id',
        'systemWideId'   => -1,         // set to null to disable system-wide fallback
    ];
    
    public function __construct(ComponentRegistry $registry, array $config = [])
    {
        parent::__construct($registry, $config);
        // Use the registry from a component, not loadComponent()
        $this->CommonQueryFlat = $registry->load('CommonQueryFlat');
    }

    /**
     * Resolve a Table from a name or pass-through a Table instance.
     */
    public function table(string|Table $table): Table
    {
        return $table instanceof Table
            ? $table
            : TableRegistry::getTableLocator()->get($table);
    }

    /**
     * Count rows for a given cloud, including system-wide (-1) by default.
     *
     * @param string|Table $table Table name or instance
     * @param int $cloudId Cloud id for tenant scoping
     * @param array $extra Extra conditions (auto-qualified with alias where possible)
     * @param array $opts  Per-call overrides for component config
     */
    public function countForCloud(string|Table $table, int $cloudId, array $extra = [], array $opts = []): int
    {
        $cfg   = array_replace_recursive($this->getConfig(), $opts);
        $Table = $this->table($table);
        $alias = $Table->getAlias();

        // Build base conditions
        $cloudField = "{$alias}.{$cfg['cloudField']}";
        $cloudVals  = [$cloudId];
        if ($cfg['systemWideId'] !== null) {
            $cloudVals[] = $cfg['systemWideId'];
        }

        $conds = [
            "{$cloudField} IN" => $cloudVals
        ];

        return (int)$Table->find()->where($conds)->count();
    }
    
    public function countForRoot(string $item){
        if($item == 'Admins'){      
            $Table = $this->table('Users');
            return (int)$Table->find()->where(['Users.group_id' => 9])->count();       
        }
        
        if(($item == 'Clouds')||($item == 'HomeServers')){      
            $Table = $this->table($item);
            return (int)$Table->find()->count();       
        }
  
    }
    
    public function countForClients(){
    
        $Table = $this->table('Clients');
        return (int)$Table->find()->count();   
    
    }

    
    /**
     * Bulk helper for multiple totals (great for your tiles).
     * Spec: [['table'=>'DynamicClients','key'=>'clients','extra'=>['active'=>1]], ...]
     */
    public function totals(array $specs, int $cloudId, array $opts = []): array
    {
        $out = [];
        foreach ($specs as $s) {
            $key   = $s['key']   ?? $s['table'];
            $table = $s['table'] ?? null;
            $extra = $s['extra'] ?? [];
            $out[$key] = $this->countForCloud($table, $cloudId, $extra, $opts);
        }
        return $out;
    }
    
    public function countPermanentUsers(int $cloudId): array {

        $PermanentUsers = TableRegistry::getTableLocator()->get('PermanentUsers');

        // Base scoped query (cloud, realm, etc.)
        $base = $PermanentUsers->find();
        $this->CommonQueryFlat->setConfig([
            'model'   => 'PermanentUsers',
            'sort_by' => 'PermanentUsers.username',
        ], false);
        $this->CommonQueryFlat->build_cloud_query($base, $cloudId);
        
        // Total users (under scope)
        $total = (clone $base)->count();

        // Online = users with at least one open session
        // Use DISTINCT to avoid double-counting users with multiple open sessions
        $online = (clone $base)
            ->distinct(['PermanentUsers.id'])
            ->innerJoin(
                ['Radaccts' => 'radacct'], // alias => table name
                [
                    'Radaccts.username = PermanentUsers.username',
                    'Radaccts.acctstoptime IS' => null,
                ]
            )
            ->count();
            
        // Check if admin_state column exists
        $PermanentUsers = TableRegistry::getTableLocator()->get('PermanentUsers');
        $schema = $PermanentUsers->getSchema();
        $hasAdminState = $schema->hasColumn('admin_state');
        
        // Suspended users (only if column exists)
        $suspended = 0;
        if ($hasAdminState) {
            $suspended = (clone $base)
                ->where(['PermanentUsers.admin_state' => 'suspended'])
                ->count();
        }

        // Terminated users (only if column exists)
        $terminated = 0;
        if ($hasAdminState) {
            $terminated = (clone $base)
                ->where(['PermanentUsers.admin_state' => 'terminated'])
                ->count();
        }
        
        // Expired users (only if column exists)
        $expired = 0;
        if ($hasAdminState) {
            $expired = (clone $base)
                ->where(['PermanentUsers.admin_state' => 'expired'])
                ->count();
        }

        return [
            'total'      => (int)$total,
            'online'     => (int)$online,
            'suspended'  => (int)$suspended,
            'terminated' => (int)$terminated,
            'expired'    => (int)$expired
        ];

    }
    
    public function countVouchers(int $cloudId): array {

        $PermanentUsers = TableRegistry::getTableLocator()->get('Vouchers');

        // Base scoped query (cloud, realm, etc.)
        $base = $PermanentUsers->find();
        $this->CommonQueryFlat->setConfig([
            'model'     => 'Vouchers',
            'sort_by'   => 'Vouchers.name'
        ], false);
        $this->CommonQueryFlat->build_cloud_query($base, $cloudId);
        
        // Total users (under scope)
        $total = (clone $base)->count();

        $online = (clone $base)
            ->distinct(['Vouchers.id'])
            ->innerJoin(
                ['Radaccts' => 'radacct'], // alias => table name
                [
                    'Radaccts.username = Vouchers.name',
                    'Radaccts.acctstoptime IS' => null,
                ]
            )
            ->count();
            
        return [
            'total'      => (int)$total,
            'online'     => (int)$online
        ];

    }
    
    public function countRadaccts(int $cloudId): int {
    
        $where = [];
    
        //====== CLOUD's Realms FILTER =====  
      	$Realms       = TableRegistry::getTableLocator()->get('Realms');	
      	$realm_list   = [];
      	$found_realm  = false;
     	$realms       = $Realms->find()->where(['Realms.cloud_id' => $cloudId])->all();
      	foreach($realms as $realm){
      		$found_realm  = true;
          	$realm_list[] = $realm->name;
          	$apRealmList  = $this->Aa->realmCheck(true);
          	if($apRealmList){
          	    $realm_list = $apRealmList;
          	}        	
     	}
     	if($found_realm){ 	
     		array_push($where, ["Radaccts.realm IN" => $realm_list]);
     	}else{
     		$this->Aa->fail_no_rights("No Realms owned by this cloud"); //If the list of realms for this cloud is empty reject the request
        	return false;
     	}      
        //====== END Realm FILTER =====  
        array_push($where,"Radaccts.acctstoptime IS NULL");
    
        $Radaccts   = TableRegistry::getTableLocator()->get('Radaccts');
        $base       = $Radaccts->find();
        $base->where($where);      
        $total      = (clone $base)->count();       
        return $total;  
    }
    
    public function countMeshNetworks(int $cloudId): array {
    
        $Meshes     = TableRegistry::getTableLocator()->get('Meshes');
        $Nodes      = TableRegistry::getTableLocator()->get('Nodes');
        
        //--Meshes--
        $m_total    = $Meshes->find()->where(['Meshes.cloud_id' => $cloudId])->count();        
        $ft_now     = FrozenTime::now();
        $ft_dead    = $ft_now->subSecond($this->dead_after);    
        $m_up       = $Meshes->find()->where(['Meshes.cloud_id' => $cloudId,'Meshes.last_contact >='  => $ft_dead])->count();
        $m_down     = $m_total - $m_up;
        
        //--Nodes--    
        $n_total    = $Nodes
            ->find()
            ->matching('Meshes', function ($q) use ($cloudId) {
                return $q->where(['Meshes.cloud_id' => $cloudId]);
            })
            ->count();
            
        $n_up       = $Nodes
            ->find()
            ->matching('Meshes', function ($q) use ($cloudId) {
                return $q->where(['Meshes.cloud_id' => $cloudId]);
            })
            ->where([
                'Nodes.last_contact >=' => $ft_dead
            ])
            ->count();
            
        $n_down     = $n_total - $n_up;
        
        return [
            'meshdesk'      => true, //Set to engate a template section in ExtJS 
            'meshes_total'  => $m_total,
            'meshes_up'     => $m_up,
            'meshes_down'   => $m_down,
            'nodes_total'   => $n_total,
            'nodes_up'      => $n_up,
            'nodes_down'    => $n_down       
        ];       
    }
    
    public function countApProfiles(int $cloudId): array {
        
        $ApProfiles = TableRegistry::getTableLocator()->get('ApProfiles');
        $Aps        = TableRegistry::getTableLocator()->get('Aps');
        
        //-- Profiles --
        $p_total    = $ApProfiles->find()->where(['ApProfiles.cloud_id' => $cloudId])->count();
        $ft_now     = FrozenTime::now();
        $ft_dead    = $ft_now->subSecond($this->dead_after);
        
        $p_up       = $ApProfiles
            ->find()
            ->where([
                'ApProfiles.cloud_id' => $cloudId
            ])
            ->matching('Aps', function ($q) use ($ft_dead) {
                return $q->where([
                    'Aps.last_contact >=' => $ft_dead
                ]);
            })
            ->count();
        $p_down     = $p_total - $p_up;
        
        //-- APs --
        $a_total    = $Aps
            ->find()
            ->matching('ApProfiles', function ($q) use ($cloudId) {
                return $q->where(['ApProfiles.cloud_id' => $cloudId]);
            })
            ->count();
            
        $a_up       = $Aps
            ->find()
            ->matching('ApProfiles', function ($q) use ($cloudId) {
                return $q->where(['ApProfiles.cloud_id' => $cloudId]);
            })
            ->where([
                'Aps.last_contact >=' => $ft_dead
            ])
            ->count();
            
        $a_down     = $a_total - $a_up;
      
        return [
            'ap_desk'               => true,
            'ap_profiles_total'     => $p_total,
            'ap_profiles_up'        => $p_up,
            'ap_profiles_down'      => $p_down,
            'aps_total'             => $a_total,
            'aps_up'                => $a_up,
            'aps_down'              => $a_down
        ];       
    }
    
    public function countUnknownHardware(): array { 
    
        $Unknown    = TableRegistry::getTableLocator()->get('UnknownNodes');
        $u_total    = $Unknown->find()->count();        
        $ft_now     = FrozenTime::now();
        $ft_dead    = $ft_now->subSecond($this->dead_after);    
        $online     = $Unknown->find()->where(['UnknownNodes.last_contact >='  => $ft_dead])->count();         
        return [
            'total'         => $u_total,
            'online'        => $online,
        ];       
    }
    
    public function countAlerts(): array { 
    
       /* $Unknown    = TableRegistry::getTableLocator()->get('UnknownNodes');
        $u_total    = $Unknown->find()->count();        
        $ft_now     = FrozenTime::now();
        $ft_dead    = $ft_now->subSecond($this->dead_after);    
        $online     = $Unknown->find()->where(['UnknownNodes.last_contact >='  => $ft_dead])->count();  */       
        return [
            'total'         => 100,
            'online'        => 10,
        ];       
    }
        
}
