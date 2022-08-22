<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component used to check and produce Ajax-ly called grid tooblaar items
//---- Date: 01-01-2016
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class GridButtonsComponent extends Component {

    public $components = ['Acl'];
    protected $scale   = 'large';  //Later we will improve the code to change this to small for smaller screens
    
    protected $btnUiReload  = 'button-orange';
    protected $btnUiAdd     = 'button-green';
    protected $btnUiDelete  = 'button-red';
    protected $btnUiEdit    = 'button-blue';
    protected $btnUiView    = 'button-orange';
    
    protected $btnUiNote    = 'default';
    protected $btnUiCSV     = 'default';
    protected $btnUiPassword = 'default';
    protected $btnUiRadius  = 'default';
    protected $btnUiEnable  = 'default';
    protected $btnUiGraph   = 'default';
    protected $btnUiMail    = 'default';
    protected $btnUiPdf     = 'default';
    protected $btnUiMap     = 'default';
    protected $btnUiUnknownClients = 'button-metal';
    protected $btnUiByod    = 'button-metal';
    
    protected $btnUiConfigure = 'default';
    protected $btnUiPolicies  = 'default';
    protected $btnUiUsers     = 'default';
    protected $btnUiTags      = 'default';
    protected $btnUiChangeMode = 'default';
    protected $btnUiRedirect  = 'default';
    protected $btnUiAttach    = 'button-blue';
    protected $btnUiAdvancedEdit = 'button-orange';
    
    protected $btnUiExecute     = 'button-green';
    protected $btnUiHistory     = 'button-blue';
    protected $btnUiRestart     = 'button-red';
    protected $btnUiRogue       = 'button-orange';
     
    protected $btnUiProfComp    = 'button-metal';
    
    
    // Execute any other additional setup for your component.
    public function initialize(array $config):void
    {
        $this->btnReload = [
            'xtype'     =>  'button', 
            'glyph'     => Configure::read('icnReload'),
            'scale'     => $this->scale,
            'itemId'    => 'reload',
            'tooltip'   => __('Reload'),
            'ui'        => $this->btnUiReload
        ];
        $this->btnReloadTimer = [
            'xtype'     => "splitbutton",
            'glyph'     => Configure::read('icnReload'),
            'scale'     => $this->scale,
            'itemId'    => 'reload',
            'tooltip'   => __('Reload'),
            'ui'        => $this->btnUiReload,
            'menu'      => [
                'items' => [
                    '<b class="menu-title">Reload every:</b>',
                    array( 'text'  => __('30 seconds'),      'itemId'    => 'mnuRefresh30s', 'group' => 'refresh','checked' => false ),
                    array( 'text'  => __('1 minute'),        'itemId'    => 'mnuRefresh1m', 'group' => 'refresh' ,'checked' => false),
                    array( 'text'  => __('5 minutes'),       'itemId'    => 'mnuRefresh5m', 'group' => 'refresh', 'checked' => false ),
                    array( 'text'  => __('Stop auto reload'),'itemId'    => 'mnuRefreshCancel', 'group' => 'refresh', 'checked' => true)
                ]
            ]
        ];
        $this->btnAdd =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnAdd'),
            'scale'     => $this->scale,
            'itemId'    => 'add',
            'tooltip'   => __('Add'),
            'ui'        => $this->btnUiAdd
        ];
		
        $this->btnEdit =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnEdit'),
            'scale'     => $this->scale,
            'itemId'    => 'edit',
            'tooltip'   => __('Edit'),
            'ui'        => $this->btnUiEdit
        ];
		
        $this->btnDelete =  [
            'xtype'     => 'button',
            'glyph'     => Configure::read('icnDelete'),
            'scale'     => $this->scale,
            'itemId'    => 'delete',
            'tooltip'   => __('Delete'),
            'ui'        => $this->btnUiDelete
        ];

        $this->btnNote = [
            'xtype'     => 'button',     
            'glyph'     => Configure::read('icnNote'), 
            'scale'     => $this->scale, 
            'itemId'    => 'note',    
            'tooltip'   => __('Add notes'),
            'ui'        => $this->btnUiNote
        ];

        $this->btnCSV = [
            'xtype'     => 'button',     
            'glyph'     => Configure::read('icnCsv'), 
            'scale'     => $this->scale, 
            'itemId'    => 'csv',      
            'tooltip'   => __('Export CSV'),
            'ui'        => $this->btnUiCSV
        ];

        $this->btnPassword = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnLock'), 
            'scale'     => $this->scale, 
            'itemId'    => 'password', 
            'tooltip'   => __('Change Password'),
            'ui'        => $this->btnUiPassword
        ];

        $this->btnEnable = [
            'xtype'     => 'button',  
            'glyph'     => Configure::read('icnLight'),
            'scale'     => $this->scale, 
            'itemId'    => 'enable_disable',
            'tooltip'   => __('Enable / Disable'),
            'ui'        => $this->btnUiEnable
        ];

        $this->btnRadius = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnRadius'), 
            'scale'     => $this->scale, 
            'itemId'    => 'test_radius',  
            'tooltip'   => __('Test RADIUS'),
            'ui'        => $this->btnUiRadius
        ];

        $this->btnGraph = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnGraph'),   
            'scale'     => $this->scale, 
            'itemId'    => 'graph',  
            'tooltip'   => __('Graphs'),
            'ui'        => $this->btnUiGraph
        ];

        $this->btnMail = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnEmail'),
            'scale'     => $this->scale, 
            'itemId'    => 'email', 
            'tooltip'   => __('e-Mail voucher'),
            'ui'        => $this->btnUiMail
        ];

        $this->btnPdf  = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnPdf'),    
            'scale'     => $this->scale, 
            'itemId'    => 'pdf',      
            'tooltip'   => __('Export to PDF'),
            'ui'        => $this->btnUiPdf
        ];
        
        $this->btnAttach = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnAttach'), 
            'scale'     => $this->scale,
            'itemId'    => 'attach',      
            'tooltip'=> __('Attach'),
            'ui'        => $this->btnUiAttach
        ];
        
        $this->btnRedirect = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnRedirect'), 
            'scale'     => $this->scale, 
            'itemId'    => 'redirect',   
            'tooltip'   => __('Redirect'),
            'ui'        => $this->btnUiRedirect
        ];
        
        $this->btnChangeMode = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnSpanner'), 
            'scale'     => $this->scale, 
            'itemId'    => 'change_device_mode',   
            'tooltip'   => __('Change Device Mode'),
            'ui'        => $this->btnUiChangeMode
        ];
		
        $this->btnMap = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnMap'), 
            'scale'     => $this->scale, 
            'itemId'    => 'map',   
            'tooltip'   => __('Map'),
            'ui'        => $this->btnUiMap
        ];
      
		
        $this->btnTags = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnTag'), 
            'scale'     => $this->scale, 
            'itemId'    => 'tag',   
            'tooltip'   => __('Manage tags'),
            'ui'        => $this->btnUiTags
        ];
        
        $this->btnPolicies = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnScale'), 
            'scale'     => $this->scale, 
            'itemId'    => 'btnPolicies',   
            'tooltip'   => __('Policies'),
            'ui'        => $this->btnUiPolicies 
        ];
        
        $this->btnUsers = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnUser'), 
            'scale'     => $this->scale, 
            'itemId'    => 'btnUsers',   
            'tooltip'   => __('Users'),
            'ui'        => $this->btnUiUsers 
        ];
        $this->btnConfigure = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnConfigure'), 
            'scale'     => $this->scale, 
            'itemId'    => 'preferences',   
            'tooltip'   => __('Preferences'),
            'ui'        => $this->btnUiConfigure
        ];
        $this->btnByod = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnDevice'), 
            'scale'     => $this->scale,
            'itemId'    => 'byod',
            'tooltip'   => __('BYOD'),
            'ui'        => $this->btnUiByod
        ];
        
        $this->btnProfComp = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnComponent'), 
            'scale'     => $this->scale,
            'itemId'    => 'profile_components',
            'tooltip'   => __('Profile Components'),
            'ui'        => $this->btnUiProfComp
        ];
        
        $this->btnUnknownClients = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnQuestion'), 
            'scale'     => $this->scale,
            'itemId'    => 'unknown_clients',
            'tooltip'   => __('Unknown Clients'),
            'ui'        => $this->btnUiUnknownClients
        ];
        
        $this->btnAdvancedEdit = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnGears'), 
            'scale'     => $this->scale,
            'itemId'    => 'advanced_edit',
            'tooltip'   => __('Advanced Edit'),
            'ui'        => $this->btnUiAdvancedEdit
        ]; 
        
        $this->btnView = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnView'), 
            'scale'     => $this->scale,
            'itemId'    => 'view',
            'tooltip'   => __('View'),
            'ui'        => $this->btnUiView
        ];
        
        $this->btnExecute = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnSpanner'), 
            'scale'     => $this->scale,
            'itemId'    => 'execute',
            'tooltip'   => __('Execute'),
            'ui'        => $this->btnUiExecute
        ];
        
        $this->btnHistory = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnWatch'), 
            'scale'     => $this->scale,
            'itemId'    => 'history',
            'tooltip'   => __('View execute history'),
            'ui'        => $this->btnUiHistory
        ];
        
        $this->btnRestart = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnPower'), 
            'scale'     => $this->scale,
            'itemId'    => 'restart',
            'tooltip'   =>  __('Restart'),
            'ui'        => $this->btnUiRestart
        ];
        
        $this->btnRogue = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnEyeSlash'), 
            'scale'     => $this->scale,
            'itemId'    => 'rogue_detect',
            'tooltip'   =>  __('Detect Rogue Access Points'),
            'ui'        => $this->btnUiRogue
        ];
        
        $this->btnAvailable = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnWatch'), 
            'scale'     => $this->scale,
            'itemId'    => 'available',
            'tooltip'   => __('View Availability History'),
            'ui'        => $this->btnUiHistory
        ]; 
        
        $this->btnAcknowledged = [
            'xtype'     => 'button', 
            'glyph'     => Configure::read('icnHandshake'), 
            'scale'     => $this->scale,
            'itemId'    => 'acknowledged',
            'tooltip'   => __('Acknowlege Alert'),
            'ui'        => $this->btnUiEdit
        ]; 
                            
    }

    public function returnButtons($user,$title = true,$type='basic'){
        //First we will ensure there is a token in the request
        $this->controller 	= $this->_registry->getController();       
        $this->title 		= $title;        
        if($title){
            $this->t = __('Action');
        }else{
            $this->t = null;
        }
        
        $menu = [];
        $this->user = $user;
           
        if($type == 'basic'){
            $b = $this->_fetchBasic();
            $menu = array($b);
        }
        
        if($type == 'add_and_delete'){
            $b = $this->_fetchAddAndDelete();
            $menu = array($b);
        }
        
        if($type == 'basic_no_disabled'){
            $b = $this->_fetchBasic('no_disabled');
            $menu = array($b);
        }
        
        if($type == 'access_providers'){
            $b  = $this->_fetchBasic();
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchApExtras();
            $n = [
                'xtype'     => 'buttongroup',
                'width'     => 150,
                'items'     => [
                    [
                    'xtype'     => 'tbtext', 
                    'html'      => [
                        '<div style="padding:2px;">',
                        '<div class="txtBlue" style="text-align: center;">Drag-And-Drop</div>',
                        '<div class="txtGreen" style="margin:3px; text-align: center;"><font size="4"><b><i class="fa fa-hand-o-down"></i> THE TREE</b></font></div>',
                        '</div>'
                    ]
                ]
                ]];
            
            
            $menu = array($b,$d,$a,$n);
        }
        
        if($type == 'realms'){
            $b  = $this->_fetchBasic();
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchRealmExtras();
            $menu = array($b,$d,$a);
        }
        
        if($type == 'basic_and_doc'){
            $b  = $this->_fetchBasic();
            $d  = $this->_fetchDocument();
            $menu = array($b,$d);
        }
        
        if($type == 'dynamic_details'){
            $b  = $this->_fetchBasic();
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchDynamicDetailExtras();
            $dc = $this->_fetchDynamicDetailDataCollection();
            $menu = [$b,$d,$a,$dc];
        }
        if($type == 'nas'){
            $b  = $this->_fetchBasic('disabled',true);
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchNas();
            $menu = array($b,$d,$a);
        }
        
        if($type == 'profiles'){
            $b  = $this->_fetchBasic();
            $n  = $this->_fetchNote();
            $a  = $this->_fetchProfilesExtras();
            $menu = array($b,$n,$a);
        }
        
        if($type == 'permanent_users'){
            $b  = $this->_fetchBasic('disabled',true,$type);
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchPermanentUserExtras();
            $menu = array($b,$d,$a);
        }

        if($type == 'fr_acct_and_auth'){
            $b  = $this->_fetchFrAcctAuthBasic();
            $menu = [$b];
        }

        if($type == 'devices'){
            $b  = $this->_fetchBasic('disabled',true,$type);
            $d  = $this->_fetchDocument();
            $a  = $this->_fetchDeviceExtras();
            $menu = array($b,$d,$a);
        }

        if($type == 'vouchers'){
            $b  = $this->_fetchBasicVoucher('disabled');
            $d  = $this->_fetchDocumentVoucher();
          //  $a  = $this->_fetchDeviceExtras();
            $a  = $this->_fetchVoucherExtras();
            $menu = array($b,$d,$a);
        }
        
        if($type == 'top_ups'){
            $b  = $this->_fetchBasic('disabled',false);
            $d  = $this->_fetchDocumentTopUp();
            $menu = array($b,$d);
        }
        
        if($type == 'unknown_ap_or_nodes'){
            $b  = $this->_fetchUnknown();
            $menu = [$b]; 
        }

        if($type == 'unknown_dynamic'){
            $b  = $this->_fetchUnknownDynamic();
            $menu = [$b]; 
        }
        
        if($type == 'dns_desk_operators'){
            $b = $this->_fetchBasic('no_disabled');
            $a  = $this->_fetchDnsDeskExtras();
            $menu = [$b,$a];
        }
        
        if($type == 'nas_map'){
            $b  = $this->_fetchNasMap();
            $menu = [$b]; 
        }
        
        if($type == 'DynamicClients'){
        
            $shared_secret = "(Please specify one)";
            if(Configure::read('DynamicClients.shared_secret')){
                $shared_secret = Configure::read('DynamicClients.shared_secret');
            }
        
            $b = $this->_fetchBasic('disabled',true,$type);
            $a  = $this->_fetchDynamicClientsExtras();
            $n = [
                'xtype'     => 'buttongroup',
                'width'     => 180,
               // 'title'     => '<span class="txtBlue"><i class="fa  fa-lightbulb-o"></i> Site Wide Shared Secret</span>',
                'items'     => [
                    [
                    'xtype'     => 'tbtext', 
                    'html'      => [
                        '<div style="padding:2px;">',
                        '<div class="txtBlue" style="text-align: center;"><i class="fa  fa-lightbulb-o"></i> Site Wide Shared Secret</div>',
                        '<div style="margin:3px; text-align: center;"><font size="4"><b>'.$shared_secret.'</b></font></div>',
                        '</div>'
                    ]
                ]
                ]];
            $menu = [$b,$a,$n];
            
        }
        
        if($type == 'Meshes'){
            $b = $this->_fetchBasicMeshes();
            $a  = $this->_fetchExtrasMeshes();
            $s  = '|';
            $s2 = '->';
			
            $fb = [
                'xtype'   => 'component', 
                'itemId'  => 'totals',  
                 'tpl'    => [
                   // "<div>",
                  //  "<label class='lblTipItem'>UP TODAY  <span style='color:#5c5f63;'>{up_today}</span></label>",
                  //  "<div style='clear:both;'></div>",
                  //  "<label class='lblTipItem'>MAX UP  <span style='color:#5c5f63;'>{max_up}</span></label>",
                  //  "</div>"
                       
                    "<div style='font-size:larger;width:300px;'>",
                    "<ul class='fa-ul'>",
                    "<li style='padding:2px;'>",
                    "<span class='fa-li' style='font-family:FontAwesome;'>&#xf20e</span> MESHES {meshes_total} <span style='color:green;'>({meshes_up} ONLINE)</span></li>",
                    "<li style='padding:2px;'><i class='fa-li fa fa-cube'></i> Nodes {nodes_total} <span style='color:green;'>({nodes_up} ONLINE)</span></li>",
                    "</ul>",
                    "</div>"                    
                ],
                'data'   =>  [],
                'cls'    => 'lblRd'
            ];
            
            $user = $this->user;        
            $menu = [$b,$a,$s,$fb]; 
         
        }
        
        if($type == 'MeshNodes'){        
            $b  = $this->_fetchBasicMeshNodes();                  
            $menu = [$b];    
        }
        
        if($type == 'NodeDetails'){
            $b = $this->_fetchNodeDetails();
            $menu = [$b]; 
        }
        
        if($type == 'MeshEntries'){
            $b = $this->_fetchCrud();
            $menu = [$b]; 
        }
        
        if($type == 'MeshExits'){
            $b = $this->_fetchCrud();
            $menu = [$b]; 
        }
        
        if($type == 'ApProfiles'){
            $b = $this->_fetchBasicApProfiles();
            $menu = [$b]; 
        }
        
        if($type == 'ApProfileEntries'){
            $b = $this->_fetchCrud();
            $menu = [$b]; 
        }
        
        if($type == 'ApProfileExits'){
            $b = $this->_fetchCrud();
            $menu = [$b]; 
        }
        
        if($type == 'Aps'){
            $b = $this->_fetchAps();
            $menu = [$b]; 
        }
        
        if($type == 'ApProfileDevices'){
            $b = $this->_fetchCrud();
            $menu = [$b]; 
        }
        
        if($type == 'Hardwares'){
            $b = $this->_fetchBasic();
            array_push($b['items'],[
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnCamera'),
                    'scale'     => $this->scale, 
                    'itemId'    => 'photo',     
                    'tooltip'   => __('Edit Photo'),
                    'ui'        => $this->btnUiEdit
                ]);
            $menu = array($b);
        }
        
        if($type == 'dynamic_translations'){
            $b = $this->_fetchDynamicTranslations();
            $menu = $b; 
        }
        
        if($type == 'Alerts'){
            $b = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
                $this->btnReload,
                $this->btnDelete,
                $this->btnAcknowledged 
            ]];
            $menu = $b; 
        }
        
        if($type == 'Schedules'){
            $b      = $this->_fetchSchedules();
            $menu   = $b;
        }
          
        return $menu;
    }
    
    //--------==============--------------
    
    private function _fetchSchedules(){
        $cmb_options = [
            'xtype'     => 'cmbScheduleOptions',
            'margin'    => '5 0 5 0',
            'isRoot'    => false,
            'itemId'    => 'cmbScheduleOptions'  
        ];
        
        $b = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
            $this->btnReload,
            $cmb_options,         
            $this->btnAdd,
            $this->btnDelete,
            $this->btnEdit
            ]
	    ];
	    $c = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
            [
                'xtype'     => 'button', 
                'glyph'     => Configure::read('icnComponent'), 
                'scale'     => $this->scale,
                'itemId'    => 'predef_cmds',
                'tooltip'   =>  __('Predefined Commands'),
                'ui'        => $this->btnUiProfComp
            ]                   
        ]];    
	    $menu = [$b,$c];
        return $menu;    
    }
    
    private function _fetchDynamicTranslations(){
        $user = $this->user;
        
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $cmb_options = [
                'xtype'     => 'cmbDynamicDetailTransOptions',
                'margin'    => '5 0 5 0',
                'isRoot'    => true,
                'itemId'    => 'cmbDynamicDetailTransOptions'  
            ];  
        }
        
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $cmb_options = [
                'xtype'     => 'cmbDynamicDetailTransOptions',
                'margin'    => '5 0 5 0',
                'isRoot'    => false,
                'itemId'    => 'cmbDynamicDetailTransOptions'  
            ];  
        }
        
        $a = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
            [
                'xtype'         => 'cmbDynamicDetailTransPages',
                'width'         => 350,
                'margin'   => '5 0 5 0',
                'labelWidth'    => 80,
                'itemId'        => 'tbCmbDynamicDetailTransPages'
            ],
            $this->btnReload
        ]];
        $b = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
            $cmb_options,         
            $this->btnAdd,
            $this->btnDelete,
            $this->btnEdit
            ]
	    ];
	    $c = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
            [
                'xtype'     => 'button', 
                'glyph'     => Configure::read('icnGears'), 
                'scale'     => $this->scale,
                'itemId'    => 'preview',
                'tooltip'   =>  __('API Reply Preview'),
                'ui'        => $this->btnUiProfComp
            ]                   
        ]];
     
        $menu = [$a,$b,$c];

        return $menu; 
    }
    
    
    private function _fetchUnknown(){
        $menu = [
                ['xtype' => 'buttongroup','title' => $this->t, 'items' => [
                   $this->btnReloadTimer,
                   $this->btnAttach,
                   $this->btnDelete, 
                   $this->btnRedirect
            ]]
        ];
        return $menu;
    }

    private function _fetchUnknownDynamic(){
        $menu = [
                ['xtype' => 'buttongroup','title' => $this->t, 'items' => [
                   $this->btnReloadTimer,
                   $this->btnAttach,
                   $this->btnDelete, 
            ]]
        ];
        return $menu;
    }

	
    private function _fetchFrAcctAuthBasic(){

        $user = $this->user;
        $menu = [];
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                    array('xtype' => 'buttongroup','title' => __('Action'), 'items' => array(
                        $this->btnReload,
                       $this->btnDelete, 
                )) 
            );
        }

        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $menu = array(
                    array('xtype' => 'buttongroup','title' => __('Action'), 'items' => array(
                        $this->btnReload,
                        $this->btnDelete, 
                )) 
            );
        }

        return $menu;
    }
    
    private function _fetchAddAndDelete(){
    
        $menu = ['xtype' => 'buttongroup', 'title' => $this->t, 'items' => [
                    $this->btnReload,
                    $this->btnAdd,
                    $this->btnDelete,    
                ]
        ];
        return $menu;
    }
    
    private function _fetchBasic($action='disabled',$with_reload_timer=false,$type=''){
    
        $user = $this->user;
        
        if($action == 'no_disabled'){
            $disabled = false; 
        }else{
            $disabled = true;
        }
        
        $menu = array();
        
        
        $reload = $this->btnReload;
        
        if($with_reload_timer == true){
            $reload = $this->btnReloadTimer;
        }
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $reload,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();

            array_push($action_group,$reload);

            //Add
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base."add")){
                array_push($action_group,$this->btnAdd);
            }
            //Delete
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'delete')){
                array_push($action_group,$this->btnDelete);
            }
            //Edit
            $edit = 'edit';
            if(($type == 'permanent_users')||($type == 'devices')){
                $edit = 'editBasicInfo';
            }
            
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.$edit)){
                array_push($action_group,$this->btnEdit);
            }

            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }   
        return $menu;
    }

    private function _fetchBasicVoucher(){
    
        $user       = $this->user;
        $disabled   = false;   
        $menu       = array();
    
        $add = [
            'xtype' 	=> 'splitbutton',   
            'glyph' 	=> Configure::read('icnAdd'),    
            'scale' 	=> $this->scale, 
            'itemId' 	=> 'add',      
            'tooltip'	=> __('Add'),
            'disabled'  => $disabled,
            'ui'        => $this->btnUiAdd,
            'menu'      => [
                    'items' => [
                        array( 'text'  => __('Single field'),      		'itemId'    => 'addSingle', 'group' => 'add', 'checked' => true ),
                        array( 'text'  => __('Username and Password'),   'itemId'    => 'addDouble', 'group' => 'add' ,'checked' => false), 
                        array( 'text'  => __('Import CSV List'),         'itemId'    => 'addCsvList','group' => 'add' ,'checked' => false),  
                    ]
            ]
        ];

        $delete = [
            'xtype' 	=> 'splitbutton',   
            'glyph' 	=> Configure::read('icnDelete'),    
            'scale' 	=> $this->scale, 
            'itemId' 	=> 'delete',      
            'tooltip'	=> __('Delete'),
            'disabled'  => $disabled,
            'ui'        => $this->btnUiDelete,
            'menu'      => [
                    'items' => [
                        array( 'text'  => __('Simple Delete'), 'itemId'    => 'deleteSimple', 'group' => 'delete', 'checked' => true ),
                        array( 'text'  => __('Bulk Delete'),   'itemId'    => 'deleteBulk', 'group' => 'delete' ,'checked' => false),  
                    ]
            ]
        ];

        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReloadTimer,
                    $add,
                    $delete,
                    $this->btnEdit
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();
            $disabled       = true;

            array_push($action_group,$this->btnReloadTimer);

            //Add
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base."add")){
                array_push($action_group,$add);
            }
            //Delete
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'delete')){
                array_push($action_group,$delete);
            }

            //Edit
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'editBasicInfo')){
                array_push($action_group,$this->btnEdit);
            }

            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }
        
        return $menu;
    }
    
    private function _fetchBasicMeshes(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					$this->btnView,
					$this->btnNote
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();
            $disabled       = true;

            array_push($action_group,$this->btnReloadTimer);
            //Add
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base."add")){
                array_push($action_group,$this->btnAdd);
            }
            //Delete
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'delete')){
                array_push($action_group,$this->btnDelete);
            }

            //Edit
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'meshEntryEdit')){
                array_push($action_group,$this->btnEdit);
            }
            
            //View
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'meshEntryView')){
                array_push($action_group,$this->btnView);
            }
            
            //Note
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'noteIndex')){
                array_push($action_group,$this->btnNote);
            }

            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }
        
        return $menu;    
    }
    
    private function _fetchExtrasMeshes(){
    
        if($this->title){
            $t = __('Maps');
        }else{
            $t = null;
        } 
   
        $menu = [
            'xtype' => 'buttongroup',
            'title' => $t, 
            'items' => [
                $this->btnMap
            ]
        ];             
        return $menu;
    }
    
     private function _fetchBasicMeshNodes(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					//$this->btnMap,
					$this->btnRestart
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP
            $id             = $user['id'];
            $action_group   = [];
            $disabled       = true;          
            $action_group   = [
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					//$this->btnMap,
					$this->btnRestart
            ];
            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }       
        return $menu;    
    }
    
    private function _fetchNodeDetails(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReload,
                    $this->btnMap,
                    $this->btnExecute,
					$this->btnHistory,
					$this->btnRestart,
					$this->btnRogue
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP
            $id             = $user['id'];
            $action_group   = [];
            $disabled       = true;          
            $action_group   = [
                    $this->btnReload,
                    $this->btnMap,
                    $this->btnExecute,
					$this->btnHistory,
					$this->btnRestart,
					$this->btnRogue
            ];
            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }       
        return $menu;    
    }
    
    private function _fetchBasicApProfiles(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					//$this->btnView,
					$this->btnNote
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();
            $disabled       = true;

            array_push($action_group,$this->btnReloadTimer);
            //Add
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base."add")){
                array_push($action_group,$this->btnAdd);
            }
            //Delete
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'delete')){
                array_push($action_group,$this->btnDelete);
            }

            //Edit
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'apProfileEntryEdit')){
                array_push($action_group,$this->btnEdit);
            }
            
            //View
            //if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'apProfileEntryView')){
            //    array_push($action_group,$this->btnView);
            //}
            
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'noteIndex')){
                array_push($action_group,$this->btnNote);
            }

            $menu = ['xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group];
        }
        
        return $menu;    
    }
    
    
    private function _fetchAps(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					$this->btnView,
					$this->btnExecute,
					$this->btnRestart
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP
            $id             = $user['id'];
            $action_group   = [];
            $disabled       = true;          
            $action_group   = [
                    $this->btnReloadTimer,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit,
					$this->btnView,
					$this->btnExecute,
					$this->btnRestart
            ];
            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }       
        return $menu;    
    }
    
     private function _fetchCrud(){
    
       $user        = $this->user;    
       $disabled    = true;    
       $menu        = [];
       
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnReload,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP
            $id             = $user['id'];
            $action_group   = [];
            $disabled       = true;          
            $action_group   = [
                    $this->btnReload,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit
            ];
            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }       
        return $menu;    
    }
    
    
    
    private function _fetchDocument(){

        $user = $this->user;
        $menu = [];      
        if($this->title){
            $t = __('Document');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                    $this->btnCSV
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $document_group = array();

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'noteIndex')){ 
                array_push($document_group,$this->btnNote);
            }

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'exportCsv')){ 
                array_push($document_group,$this->btnCSV);
            }

            $menu = array('xtype' => 'buttongroup', 'title' => $t,        'items' => $document_group );
        }
            
        return $menu;
    }

    private function _fetchNas(){

        $user = $this->user;
        $menu = array();
        
        if($this->title){
            $t = __('Nas');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                'xtype' => 'buttongroup',
                'title' => __('Nas'), 
                'items' => array(
					$this->btnGraph,
					$this->btnTags,
					$this->btnMap
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $nas_group = array();

            array_push($nas_group,$this->btnGraph);
            //Tags
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'manage_tags')){
                array_push($nas_group,$this->btnTags);
            }
            array_push($nas_group,$this->btnMap);

            $menu = array('xtype' => 'buttongroup', 'title' => $t,        'items' => $nas_group );
        }
            
        return $menu;
    }

    private function _fetchDocumentVoucher(){

        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Document');
        }else{
            $t = null;
        }     
            
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                    $this->btnPdf,
                    $this->btnCSV,
                    $this->btnMail
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
           $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                    $this->btnPdf,
                    $this->btnCSV,
                    $this->btnMail
                )
            );
        }           
        return $menu;
    }
    
    private function _fetchDocumentTopUp(){
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Document');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'width' => 100,
                'items' => array(
                    $this->btnCSV
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $document_group = array();
         
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'exportCsv')){ 
                array_push($document_group,$this->btnCSV);
            }

            $menu = array('xtype' => 'buttongroup', 'title' => $t,  'width' => 100,  'items' => $document_group );
        }
            
        return $menu;
    
    
    }
    
    private function _fetchNote(){

        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Document');
            $w = 100;
        }else{
            $t = null;
            $w = 60;
        } 
         
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'width' => $w,
                'items' => array(
                    $this->btnNote
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $document_group = array();

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'noteIndex')){ 
                array_push($document_group,$this->btnNote);
            }

            $menu = array('xtype' => 'buttongroup', 'title' => $t, 'width' => 100,  'items' => $document_group );
        }         
        return $menu;
    }
    
    private function _fetchApExtras(){

        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = [
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                    $this->btnPassword,
                    $this->btnEnable
                )
            ];    
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $specific_group = array();

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'changePassword')){      
                array_push($specific_group,$this->btnPassword);
           }
            
           if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'enableDisable')){      
                array_push($specific_group, $this->btnEnable);
            }
           
            $menu = array('xtype' => 'buttongroup', 'title' => $t, 'items' => $specific_group );
        }
            
        return $menu;
    }
    
    private function _fetchRealmExtras(){
        if($this->title){
            $t = __('More');
        }else{
            $t = null;
        } 
    
        $menu = array(
            'xtype' => 'buttongroup',
            'title' => $t, 
            'items' => array(
                $this->btnGraph,
                array(
                    'xtype'     => 'button', 
                    'glyph'     => Configure::read('icnCamera'),
                    'scale'     => $this->scale, 
                    'itemId'    => 'logo',     
                    'tooltip'   => __('Edit logo')
                )
            )
        );             
        return $menu;
    }
    
    private function _fetchDynamicDetailDataCollection(){
    
        if($this->title){
            $t = __('Data Collection');
        }else{
            $t = null;
        } 
    
        $menu = array(
            'xtype' => 'buttongroup',
            'title' => $t,
           // 'width' => 150, 
            'items' => [
                [
                    'xtype'     => 'button',  
                    'glyph'     => Configure::read('icnEmail'),  
                    'scale'     => $this->scale, 
                    'itemId'    => 'dcEmail',    
                    'tooltip'   => __('Email Addresses')
                ],
                [
                    'xtype'     => 'button',  
                    'glyph'     => Configure::read('icnGlobe'),  
                    'scale'     => $this->scale, 
                    'itemId'    => 'translate',    
                    'tooltip'   => __('Translated Phrases')
                ]
            ]
        );             
        return $menu;
    }
    
      private function _fetchDynamicDetailExtras(){
      
        if($this->title){
            $t = __('Preview');
        }else{
            $t = null;
        } 
        $menu = array(
            'xtype' => 'buttongroup',
            'title' => $t, 
            'items' => array(
                array(
                    'xtype'     => 'button',  
                    'glyph'     => Configure::read('icnMobile'),  
                    'scale'     => $this->scale, 
                    'itemId'    => 'mobile',    
                    'tooltip'   => __('Preview')
                )
            )
        );             
        return $menu;
    }
    
    private function _fetchPermanentUserExtras(){
    
        $user = $this->user;
        $menu = []; 
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = [
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => [
                   $this->btnPassword,
                   $this->btnEnable,
                   $this->btnRadius,
                   $this->btnGraph,
                   $this->btnByod
                ]
            ];    
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $specific_group = array();

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'changePassword')){      
                array_push($specific_group,$this->btnPassword);
           }
            
           if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'enableDisable')){      
                array_push($specific_group, $this->btnEnable);
            }
            //FIXME when FreeRadius has been ported ... update this one also
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), 'Access Providers/Controllers/FreeRadius/testRadius')){      
                array_push($specific_group, $this->btnRadius);
            }
            
            array_push($specific_group,$this->btnGraph);
            array_push($specific_group,$this->btnByod);
           
            $menu = array('xtype' => 'buttongroup', 'title' =>  $t, 'items' => $specific_group );
        }
                
        return $menu;
    }

    private function _fetchDeviceExtras(){
    
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                    $this->btnEnable,
                    $this->btnRadius,
                    $this->btnGraph
                )
            );    
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $specific_group = array();
      
           if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'enableDisable')){      
                array_push($specific_group, $this->btnEnable);
            }
            
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), 'Access Providers/Controllers/FreeRadius/testRadius')){      
                array_push($specific_group, $this->btnRadius);
            }
            
            array_push($specific_group, $this->btnGraph);
           
            $menu = array('xtype' => 'buttongroup', 'title' =>  $t, 'items' => $specific_group );
        }              
        return $menu;
    }
    
    private function _fetchDnsDeskExtras(){
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = [
                'xtype' => 'buttongroup',
                'title' => $t,
                'width' => 150,
                'items' => [
                    $this->btnPolicies,
                    $this->btnUsers
                ]
            ];    
        }
        return $menu;
    }
    
     private function _fetchProfilesExtras(){
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
            $w = 150;
        }else{
            $t = null;
            $w = 110;
        } 
        
        //Admin => all power
      //  if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = [
                'xtype' => 'buttongroup',
                'title' => $t,
                'width' => $w,
                'items' => [
                    $this->btnProfComp,
                    $this->btnAdvancedEdit
                ]
            ];    
     //   }
        return $menu;
    }


    private function _fetchVoucherExtras(){
    
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        } 
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin   
             $menu = array(
                'xtype' => 'buttongroup',
                'title' => $t, 
                'items' => array(
                   $this->btnPassword,
                   $this->btnRadius,
                   $this->btnGraph
                )
            );    
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $specific_group = array();

            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'changePassword')){      
                array_push($specific_group,$this->btnPassword);
            }
             
            if($this->Acl->check(array('model' => 'Users', 'foreign_key' => $id), 'Access Providers/Controllers/FreeRadius/testRadius')){      
                array_push($specific_group, $this->btnRadius);
            }
            
            array_push($specific_group,$this->btnGraph);
           
            $menu = array('xtype' => 'buttongroup', 'title' =>  $t, 'items' => $specific_group );
        }
                
        return $menu;
    }

    private function _fetchNasMap(){
    
        $user = $this->user;
          
        $menu = [];
        
        //Admin => all power
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $menu = array('xtype' => 'buttongroup','title' => $this->t, 'items' => array(
                    $this->btnConfigure,
                    $this->btnAdd,
                    $this->btnDelete,
					$this->btnEdit
                )
            );
        }
        
        //AP depend on rights
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id             = $user['id'];
            $action_group   = array();

            array_push($action_group,$this->btnConfigure);

            //Add
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base."add")){
                array_push($action_group,$this->btnAdd);
            }
            //Delete
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'delete')){
                array_push($action_group,$this->btnDelete);
            }
            //Edit
            if($this->controller->Acl->check(array('model' => 'Users', 'foreign_key' => $id), $this->controller->base.'edit')){
                array_push($action_group,$this->btnEdit);
            }
            $menu = array('xtype' => 'buttongroup','title' => $this->t,  'items' => $action_group);
        }   
        return $menu;
    }
    
    function _fetchDynamicClientsExtras(){
    
        $user = $this->user;
        $menu = [];
        
        if($this->title){
            $t = __('Extra Actions');
        }else{
            $t = null;
        }
        
        $m_items = [
            $this->btnNote,
            $this->btnCSV,
            $this->btnGraph,
            $this->btnMap,
            $this->btnAvailable
        ];
        
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            array_push($m_items,$this->btnUnknownClients);
        }
        if($user['group_name'] == Configure::read('group.ap')){ //AP (with overrides)
            $id  = $user['id'];
            if($this->controller->Acl->check(['model' => 'Users', 'foreign_key' => $id], 'Access Providers/Controllers/UnknownDynamicClients/index')){
                array_push($m_items,$this->btnUnknownClients);
            }
        }
        
        $menu = ['xtype' => 'buttongroup','title' => $t, 'items' => $m_items ];    
        return $menu;  
    }
    

}
