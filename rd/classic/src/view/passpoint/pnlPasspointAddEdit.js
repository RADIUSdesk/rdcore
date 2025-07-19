Ext.define('Rd.view.passpoint.pnlPasspointAddEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlPasspointAddEdit',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires    : [
        'Rd.view.passpoint.vcPasspointAddEdit',
        'Rd.view.passpoint.tagEapMethods',
   //     'Rd.view.passpoint.cmbVenueTypes',
        'Rd.view.passpoint.cmbNetworkTypes',
        'Rd.view.passpoint.cntPasspointDomains',
        'Rd.view.passpoint.cntNaiRealms',
        'Rd.view.passpoint.cntRcois',
        'Rd.view.passpoint.cntCellNetworks',
        'Rd.view.passpoint.cmbVenueGroups',
        'Rd.view.passpoint.cmbVenueGroupTypes'
    ],
    controller  : 'vcPasspointAddEdit',
    customFields : [
        'pnlNetwork',
        'pnlSignup',
        'idHessid',
        'idVenueName',
        'idVenueUrl'
    ], 
    initComponent: function(){
        var me          = this;
        var w_prim      = 550; 
        var l_style     = 'color: #9d9d9d;font-stretch: expanded;font-weight:100;font-size:16px;';
        var plus_style  = 'text-align: left; display: block; margin:10px;margin-bottom:20px;';
               
        var ipv4_type = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":0, "name":'Address type not available'},
                {"id":1, "name":'Public IPv4 address available'},
                {"id":2, "name":'Port-restricted IPv4 address available'},
                {"id":3, "name":'Single NATed private IPv4 address available'},
                {"id":4, "name":'Double NATed private IPv4 address available'},
                {"id":5, "name":'Port-restricted IPv4 address and single NATed IPv4 address available'},
                {"id":6, "name":'Port-restricted IPv4 address and double NATed IPv4 address available'},
                {"id":7, "name":'Availability of the address type is not known'}
            ]
        });
        
        var ipv6_type = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":0, "name":'Address type not available'},
                {"id":1, "name":'Address type available'},
                {"id":2, "name":'Availability of the address type not known'}
            ]
        });
        
        var auth_type = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":'00', "name":'Acceptance of terms and conditions'},
                {"id":'01', "name":'On-line enrollment supported'},
                {"id":'02', "name":'HTTP/HTTPS Redirection'},
                {"id":'03', "name":'DNS redirection'},
            ]
        });
        
        var gas3 = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":0, "name":'P2P specification (Address3 = AP BSSID)'},
                {"id":1, "name":'IEEE 802.11 standard compliant'},
                {"id":2, "name":'Force non-compliant behavior'},
            ]
        });                       
        var cntHotspot  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [ 
                {
                    xtype       : 'textfield',
                    name        : 'id',
                    hidden      : true,
                    value	    : me.passpoint_profile_id
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    name        : 'name',
                    allowBlank  : false
                },
                {           
                    xtype       : 'cmbVenueGroups'
                },
                {           
                    xtype       : 'cmbVenueGroupTypes'
                },
                {           
                    xtype       : 'cmbNetworkTypes'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    emptyText   : 'example eng:Example venue',
                    anchor      : '100%',
                    fieldLabel  : 'Venue Name',
                    itemId      : 'idVenueName',
                    hidden      : true,
                    disabled    : true,
                    name        : 'venue_name',
                    allowBlank  : true,
                    labelClsExtra: 'lblRd' 
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    emptyText   : 'example 1:http://www.example.com/info-eng',
                    anchor      : '100%',
                    fieldLabel  : 'Venue URL',
                    itemId      : 'idVenueUrl',
                    hidden      : true,
                    disabled    : true,
                    name        : 'venue_url',
                    allowBlank  : true,
                    labelClsExtra: 'lblRd' 
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'dot11HESSID',
                    itemId      : 'idHessid',
                    hidden      : true,
                    disabled    : true,
                    name        : 'hessid',
                    allowBlank  : true,
                    labelClsExtra: 'lblRd'                    
                }           
            ]
        };
        
        var cntServiceProviders = {
            xtype       : 'container',
            itemId      : 'cntServiceProviders',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype   : 'label',
                    itemId  : 'lblWarn',
                    style   : 'color:#de9516;font-stretch: expanded;font-weight:100;font-size:12px;padding:20px;',
                    html    : '<br><i class="fa fa-sticky-note"></i> Specify at least one provider<br><br>',
                },          
              /*  {
                    xtype   : 'label',
                    style   : l_style,
                    html    : 'DOMAIN LIST',
                },*/
                {
                    xtype       : 'component',
                    html        : 'DOMAIN LIST',
                    cls         : 'heading'
                },                              
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntDomains'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addDomain');
                            });
                        }
                    }
                },             
             /*   {
                    xtype   : 'label',
                    style   : l_style,
                    html    : 'NAI REALMS',
                },*/
                {
                    xtype       : 'component',
                    html        : 'NAI REALMS',
                    cls         : 'heading'
                },               
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntNaiRealms'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addNaiRealm');
                            });
                        }
                    }
                },
                
              /*  {
                    xtype   : 'label',
                    style   : l_style,
                    html    : 'RCOI LIST',
                },*/
                {
                    xtype       : 'component',
                    html        : 'RCOI LIST',
                    cls         : 'heading'
                }, 
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntRcois'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addRcoi');
                            });
                        }
                    }
                },                
              /*  {
                    xtype   : 'label',
                    style   : l_style,
                    html    : '3GPP CELLULAR NETWORK',
                },*/
                {
                    xtype       : 'component',
                    html        : '3GPP CELLULAR NETWORK',
                    cls         : 'heading'
                }, 
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntCellNetworks'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addCellNetwork');
                            });
                        }
                    }
                }                                            
            ]  
        };
        
        var cntNetwork = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    fieldLabel  : 'Network Availibility IPv4',
                    store       : ipv4_type,
                    name        : 'ipv4_type',
                    queryMode   : 'local',
                    displayField: 'name',
                    valueField  : 'id',
                    xtype       : 'combobox',
                    value       : 3,
                    labelClsExtra : 'lblRd'
                },
                {
                    fieldLabel  : 'Network Availibility IPv6',
                    store       : ipv6_type,
                    name        : 'ipv6_type',
                    queryMode   : 'local',
                    displayField: 'name',
                    valueField  : 'id',
                    xtype       : 'combobox',
                    value       : 2,
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'anqp_elem',
                    emptyText   : 'example 266:000000',
                    fieldLabel  : 'Add ANQP-elements',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    fieldLabel  : 'GAS Addr 3 Behavior',
                    store       : gas3,
                    name        : 'gas_address3',
                    queryMode   : 'local',
                    displayField: 'name',
                    valueField  : 'id',
                    xtype       : 'combobox',
                    value       : 0,
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'QoS Map Set',
                    emptyText   : 'example 53,2,22,6,8,15,0,7,255,255,16,31,32,39,255,255,40,47,255,255',
                    name        : 'qos_map_set',
                    labelClsExtra : 'lblRd'
                },
              /*  {
                    xtype       : 'label',
                    style       : l_style,
                    html        : 'NETWORK ACCESS',
                },*/
                {
                    xtype       : 'component',
                    html        : 'NETWORK ACCESS',
                    cls         : 'heading'
                },  
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Internet',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'internet',
                    checked     : true          
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Enable Requested Connectivity to User Information (CUI)',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'request_cui',
                    checked     : true          
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Additional Step Required for Access',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'asra'          
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Emergency services reachable',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'esr'          
                }, 
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Unauthenticated emergency service accessible',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'uesa'          
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'OSU Server-Only Authenticated L2 Encryption Network',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'osen'          
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Disable Downstream Group-Addressed Forwarding (DGAF)',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'disable_dgaf'          
                },
                {
                    fieldLabel  : 'Network Auth Type',
                    itemId      : 'cmbNetworkAuthType',
                    store       : auth_type,
                    name        : 'network_auth_type',
                    queryMode   : 'local',
                    displayField: 'name',
                    valueField  : 'id',
                    xtype       : 'combobox',
                    value       : '00',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Network Auth URL',
                    itemId      : 'txtNetworkAuthUrl',
                    emptyText   : 'example http://www.example.com/redirect/me/here/',
                    name        : 'network_auth_type_url',
                    labelClsExtra : 'lblRdReq',
                    hidden      : true,
                    disabled    : true
                },                 
              /*  {
                    xtype       : 'label',
                    style       : l_style,
                    html        : 'HOTSPOT 2.0',
                }, */
                {
                    xtype       : 'component',
                    html        : 'HOTSPOT 2.0',
                    cls         : 'heading'
                },                
                {
                    xtype       : 'numberfield',
                    name        : 'anqp_domain_id',
                    fieldLabel  : 'ANQP Domain ID',
                    allowBlank  : false,
                    maxValue    : 65535,
                    minValue    : 0,
                    value       : 0,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                },              
                {
                    xtype       : 'numberfield',
                    name        : 'hs20_deauth_req_timeout',
                    fieldLabel  : 'De-auth Timeout',
                    allowBlank  : false,
                    maxValue    : 3600,
                    minValue    : 0,
                    value       : 60,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'hs20_oper_friendly_name',
                    emptyText   : 'example eng:Example operator',
                    fieldLabel  : 'Operator Friendly Name',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'hs20_conn_capab',
                    emptyText   : 'example 1:0:2',
                    fieldLabel  : 'Connection Capability',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'WAN Metrics',
                    emptyText   : 'example 01:8000:1000:80:240:3000',
                    name        : 'hs20_wan_metrics',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Operating Class',
                    emptyText   : 'example 5173',
                    name        : 'hs20_operating_class',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'T&C Filename',
                    emptyText   : 'example terms-and-conditions',
                    name        : 'hs20_t_c_filename',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'T&C Timestamp',
                    emptyText   : 'example 1234567',
                    name        : 'hs20_t_c_timestamp',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'T&C URL',
                    emptyText   : 'example https://example.com/t_and_c?addr=@1@&ap=123',
                    name        : 'hs20_t_c_server_url',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'hs20_icon',
                    emptyText   : 'example 32:32:eng:image/png:icon32:/tmp/icon32.png',
                    fieldLabel  : 'OSU and Operator Icons',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'operator_icon',
                    emptyText   : 'example icon32',
                    fieldLabel  : 'Operator Icons',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                }                             
            ]  
        };
        
        var cntOsu = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'OSU SSID',
                    emptyText   : 'example OSU',
                    name        : 'osu_ssid',
                    labelClsExtra : 'lblRd'
                },
             /*   {
                    xtype       : 'label',
                    style       : l_style,
                    html        : 'PROVIDERS',
                }, */
                {
                    xtype       : 'component',
                    html        : 'PROVIDERS',
                    cls         : 'heading'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'OSU Server URI',
                    emptyText   : 'example https://example.com/osu/',
                    name        : 'osu_server_uri',
                    labelClsExtra : 'lblRd'
                },                
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'osu_friendly_name',
                    emptyText   : 'example eng:Example operator',
                    fieldLabel  : 'OSU Friendly Name',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'OSU NAI',
                    emptyText   : 'example https://example.com/osu/',
                    name        : 'osu_nai',
                    labelClsExtra : 'lblRd'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'OSU NAI2',
                    emptyText   : 'example https://example.com/osu/',
                    name        : 'osu_nai2',
                    labelClsExtra : 'lblRd'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'OSU Method List',
                    emptyText   : 'example 1 0',
                    name        : 'osu_method_list',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'osu_icon',
                    emptyText   : 'example icon32',
                    fieldLabel  : 'OSU Icon',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'osu_service_desc',
                    emptyText   : 'example eng:Example services',
                    fieldLabel  : 'OSU Service Desc',
                    anchor      : '100%',
                    labelClsExtra : 'lblRd'
                } 
            ]  
        };
              
         me.items = [
            {
                xtype       : 'container',             
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                items       : [
                    {
                        xtype       : 'radiogroup',
                        width       : w_prim,
                        layout      : {
			                type	: 'hbox',
			                align	: 'middle',
			                pack	: 'stretchmax',
			                padding	: 0,
			                margin	: 0
		                },
                        defaultType : 'button',
				        defaults    : {
			                enableToggle    : true,
			                toggleGroup     : 'show_options',
			                allowDepress    : false,					
		                },             
                        items: [
			                { text: 'Easy Setup',   itemId: 'btnEasy',   glyph: Rd.config.icnGear, flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true },
			                { text: 'Custom Setup', itemId: 'btnCustom', glyph: Rd.config.icnGears,   flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5', pressed: false},
		                ]
                    }
                ]
            },
            {
                xtype       : 'panel',
                title       : 'Hotspot Identification',
              //  glyph       : Rd.config.icnGears,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntHotspot				
            },
            {
                xtype       : 'panel',
                title       : 'Service Provider Information',
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntServiceProviders				
            },
            {
                xtype       : 'panel',
                itemId      : 'pnlNetwork',
                hidden      : true,
                disabled    : true,
                title       : 'Network Capabilities', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntNetwork				
            },
            {
                xtype       : 'panel',
                itemId      : 'pnlSignup',
                hidden      : true,
                disabled    : true,
                title       : 'Online Sign-Up and Provisioning', 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntOsu				
            }
        ];    
      
        me.callParent(arguments);
    }
});
