Ext.define('Rd.view.meshes.winMeshAddExit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMeshAddExit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      i18n('sNew_mesh_exit_point'),
    width:      600,
    height:     530,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph:      Rd.config.icnAdd,
    autoShow:   false,
    store:      undefined,
    defaults: {
            border: false
    },
    listeners   : {
        afterrender : 'onAfterRender'
    },
    startScreen: 'scrnType', //Default start screen
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.components.cmbDynamicDetail',
        'Rd.view.components.cmbRealm',
        'Rd.view.components.cmbOpenVpnServers',
        'Rd.view.meshes.vcMeshExitPoint',
        'Rd.view.meshes.cmbMeshUpstreamList',
        'Rd.view.meshes.tagMeshEntryPoints',
        'Rd.view.meshes.cmbTrafficClasses',
        'Rd.view.components.pnlExitPointNatDhcp'
    ],
    controller  : 'vcMeshExitPoint',
    initComponent: function() {
        var me              = this;
        var scrnType  = me.mkScrnType();
        var scrnData  = me.mkScrnData();
        me.items = [
            scrnType,
            scrnData
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnType: function(){

        var me      = this;
        var buttons = [
             
                {
                    itemId: 'btnTypeNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin: Rd.config.buttonMargin
                }
            ];

        //See if the Ethernet bridge is already taken; if so we will not list it again
        var found_bridge = false;
        me.store.each(function(item, index, count){
            var type = item.get('type');
            if(type == 'bridge'){
                found_bridge = true;
                return false;
            }
        });

        //If the bridge is already defined; we will not list it again
        if(found_bridge == true){
            var radios = [
                    { 
                        boxLabel: "<i class=\"fa fa-tag\"></i> "+'Layer2 Tagged Ethernet Bridge',   
                        name    : 'exit_type', 
                        inputValue: 'tagged_bridge'
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-tag\"></i> "+'Layer3 Tagged Ethernet Bridge',   
                        name    : 'exit_type', 
                        inputValue: 'tagged_bridge_l3' 
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-arrows-alt\"></i> "+i18n("sNAT_plus_DHCP"),
                        name    : 'exit_type', 
                        inputValue: 'nat' 
                    },
                    {   
                        boxLabel:"<i class=\"fa fa-key\"></i> "+i18n("sCaptive_Portal"),
                        name    : 'exit_type', 
                        inputValue: 'captive_portal' 
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-quote-right\"></i> "+i18n('sOpenVPN_Bridge'),
                        name: 'exit_type', 
                        inputValue: 'openvpn_bridge' 
                    }     
                ];
        }else{
            var radios = [
                    { 
                        boxLabel: "<i class=\"fa fa-bars\"></i> "+i18n("sEthernet_bridge"),          
                        name    : 'exit_type', 
                        inputValue: 'bridge',
                        checked: true 
                    },              
                    { 
                        boxLabel: "<i class=\"fa fa-tag\"></i> "+'Layer2 Tagged Ethernet Bridge',   
                        name    : 'exit_type', 
                        inputValue: 'tagged_bridge'
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-tag\"></i> "+'Layer3 Tagged Ethernet Bridge',   
                        name    : 'exit_type', 
                        inputValue: 'tagged_bridge_l3' 
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-arrows-alt\"></i> "+i18n("sNAT_plus_DHCP"),
                        name    : 'exit_type', 
                        inputValue: 'nat' 
                    },
                    {   
                        boxLabel:"<i class=\"fa fa-key\"></i> "+i18n("sCaptive_Portal"),
                        name    : 'exit_type', 
                        inputValue: 'captive_portal' 
                    },
                    { 
                        boxLabel: "<i class=\"fa fa-quote-right\"></i> "+i18n('sOpenVPN_Bridge'),
                        name: 'exit_type', 
                        inputValue: 'openvpn_bridge' 
                   }     
                ];
        }

        var frmType = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnType',
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'top',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            items:[{
                xtype       : 'radiogroup',
                fieldLabel  : i18n('sExit_point_type'),
                columns     : 2,
                vertical    : true,
                itemId      : 'rgrpExitType',
                items       : radios
            }],
            buttons: buttons
        });
        return frmType;
    },

    //_______ Data for mesh  _______
    mkScrnData: function(){

        var me      = this;

        //Set the combo
        var tagConnectWith = Ext.create('Rd.view.meshes.tagMeshEntryPoints',{
            labelClsExtra   : 'lblRdReq'
        });
 
        tagConnectWith.getStore().getProxy().setExtraParam('mesh_id',me.meshId);
        tagConnectWith.getStore().load();
        
        var basic_t_items = [
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sRADIUS_server1'),
                name        : 'radius_1',
                allowBlank  : false,
                blankText   : i18n('sSupply_a_value'),
                labelClsExtra: 'lblRdReq'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sRADIUS_server2'),
                name        : 'radius_2',
                allowBlank  : true,
                labelClsExtra: 'lblRd'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sRADIUS_secret'),
                name        : 'radius_secret',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq'
            },
             {
                xtype       : 'textfield',
                fieldLabel  : i18n('sRADIUS_NASID'),
                name        : 'radius_nasid',
                itemId      : 'radius_nasid',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                hidden      : true, //Hide it initially
                disabled    : true //Disable it intitially 
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sUAM_URL'),
                name        : 'uam_url',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sUAM_Secret'),
                name        : 'uam_secret',
                allowBlank  : true,
                labelClsExtra: 'lblRd'
            },
            {
                xtype       : 'textareafield',
                grow        : true,
                fieldLabel  : i18n('sWalled_garden'),
                name        : 'walled_garden',
                anchor      : '100%',
                allowBlank  : true,
                labelClsExtra: 'lblRd'
             },
             {
                xtype       : 'checkbox',      
                fieldLabel  : i18n('sSwap_octets'),
                name        : 'swap_octet',
                inputValue  : 'swap_octet',
                checked     : true,
                labelClsExtra: 'lblRdReq'
            },
            {
                xtype       : 'checkbox',      
                fieldLabel  : i18n('sMAC_authentication'),
                name        : 'mac_auth',
                inputValue  : 'mac_auth',
                checked     : true,
                labelClsExtra: 'lblRdReq'
            }
        ];
        
        var dns_t_items = [
            {
                itemId      : 'chkDnsOverride',
                xtype       : 'checkbox',      
                fieldLabel  : 'Enable Override',
                name        : 'dns_manual',
                inputValue  : 'dns_manual',
                checked     : false,
                labelClsExtra: 'lblRd',
                listeners   : {
		            change  : 'onChkDnsOverrideChange'
		        }
            },
            {
                itemId      : 'txtDns1',
                xtype       : 'textfield',
                fieldLabel  : 'DNS-1',
                name        : 'dns1',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                disabled    : true
            },
            {
                itemId      : 'txtDns2',
                xtype       : 'textfield',
                fieldLabel  : 'DNS-2',
                name        : 'dns2',
                allowBlank  : true,
                labelClsExtra: 'lblRd',
                disabled    : true
            },
            {
                itemId      : 'chkAnyDns',
                xtype       : 'checkbox',      
                fieldLabel  : 'Allow Any DNS',
                name        : 'uamanydns',
                inputValue  : 'uamanydns',
                checked     : true,
                labelClsExtra: 'lblRd'
            },
            {
                xtype       : 'checkbox',      
                fieldLabel  : 'DNS Paranoia',
                name        : 'dnsparanoia',
                inputValue  : 'dnsparanoia',
                checked     : false,
                labelClsExtra: 'lblRd'
            },
            {
                itemId      : 'chkDnsDesk',
                xtype       : 'checkbox',      
                fieldLabel  : 'Use DNS Ident',
                name        : 'dnsdesk',
                inputValue  : 'dnsdesk',
                checked     : false,
                labelClsExtra: 'lblRd',
                listeners   : {
		            change  : 'onChkDnsDeskChange'
		        }
            },
            {
                xtype       : 'fieldset',
                title       : 'DNS Ident Settings',
                hidden      : true,
                disabled    : true,
                itemId      : 'fsDnsIdent',
                defaultType : 'textfield',
                margin      : 10,
                defaults    : {
                    anchor: '100%'
                },
                items: [
                    { 
                        allowBlank  : false, 
                        fieldLabel  : 'IP Address',
                        labelClsExtra: 'lblRdReq', 
                        name        : 'dns_ident_ip',
                        itemId      : 'DnsIdentIp',
                        disabled    : true
                    },
                    { 
                        allowBlank  : false, 
                        fieldLabel  : 'Operator Name',
                        labelClsExtra: 'lblRdReq', 
                        name        : 'dns_ident_op_name',
                        itemId      : 'DnsIdentOpName',
                        disabled    : true
                    },
                    { 
                        allowBlank  : false, 
                        fieldLabel  : 'Operator Password',
                        labelClsExtra: 'lblRdReq', 
                        name        : 'dns_ident_op_pwd',
                        itemId      : 'DnsIdentOpPwd',
                        disabled    : true
                    },
                    {
                        xtype       : 'numberfield',
                        name        : 'dns_ident_max_users',
                        fieldLabel  : 'Number Of Users',
                        labelClsExtra: 'lblRdReq',
                        value       : 5,
                        maxValue    : 100,
                        minValue    : 1
                    }
                ]
            }
        ];
        
        var proxy_t_items = [
            {
                itemId      : 'chkProxyEnable',
                xtype       : 'checkbox',      
                fieldLabel  : 'Enable',
                name        : 'proxy_enable',
                inputValue  : 'proxy_enable',
                checked     : false,
                labelClsExtra: 'lblRdReq'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : 'Upstream proxy',
                name        : 'proxy_ip',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                disabled    : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : 'Upstream port',
                name        : 'proxy_port',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                disabled    : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : 'Auth name',
                name        : 'proxy_auth_username',
                allowBlank  : true,
                labelClsExtra: 'lblRd',
                disabled    : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : 'Auth password',
                name        : 'proxy_auth_password',
                allowBlank  : true,
                labelClsExtra: 'lblRd',
                disabled    : true
            }
        ];
        
        
        var cp_tabs = [
            {
                title       : 'Basic',
                layout      : 'anchor',
                defaults    : {
                    anchor: '100%'
                },
                autoScroll  :true,
                items       : basic_t_items
            },
            {
                title       : 'DNS',
                itemId      : 'tabDns',
                layout      : 'anchor',
                defaults    : {
                        anchor: '100%'
                },
                autoScroll  : true,
                items       : dns_t_items
            }, 
            {
                title       : 'Proxy',
                itemId      : 'tabProxy',
                layout      : 'anchor',
                defaults    : {
                        anchor: '100%'
                },
                autoScroll:true,
                items       : proxy_t_items
            }, 
            {
                title       : 'Coova Specific',
                layout      : 'anchor',
                defaults    : {
                        anchor: '100%'
                },
                autoScroll:true,
                items       :[
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        fieldLabel  : 'Optional config items',
                        name        : 'coova_optional',
                        anchor      : '100%',
                        allowBlank  : true,
                        labelClsExtra: 'lblRd'
                     }
                ]
            },
            {
                title       : 'Upstream Interface',
                layout      : 'anchor',
                defaults    : {
                        anchor: '100%'
                },
                items       :[
                    {
                       xtype            : 'cmbMeshUpstreamList',
                       mesh_id          : me.meshId,
                       labelClsExtra    : 'lblRdReq',
                       value            : 0
                    }     
                ]
            }     
        ];
        
        var t_xwf =  {
            title       : 'Express Wi-Fi',
            glyph		: Rd.config.icnFacebook,
            layout      : 'anchor',
             autoScroll :true,
            defaults    : {
                    anchor: '100%'
            },
            items       :[
                 {
                    itemId      : 'chkXwfEnable',
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Enable',
                    name        : 'xwf_enable',
                    inputValue  : 'xwf_enable',
                    checked     : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                   xtype            : 'cmbTrafficClasses',
                   labelClsExtra    : 'lblRdReq', //xwf_traffic_class_id
                   hidden           : true,
                   disabled         : true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Landing Page URL',
                    name        : 'xwf_uamhomepage',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    value       : me.xwf_uamhomepage, //Pre-populate it on ADD
                    hidden           : true,
                    disabled         : true
                },
                {
                   xtype            : 'cmbHomeServerPools',
                   labelClsExtra    : 'lblRdReq', //xwf_traffic_class_id
                   hidden           : true,
                   disabled         : true
                },
                {
                    itemId          : 'chkXwfBwEnable',
                    xtype           : 'checkbox',      
                    fieldLabel      : 'Limit Bandwidth',
                    name            : 'xwf_bw_enable',
                    inputValue      : 'xwf_bw_enable',
                    hidden          : true,
                    disabled        : true,
                    labelClsExtra   : 'lblRdReq'
                },
                {
		            xtype       : 'container',
                    layout      : 'hbox',
                    itemId      : 'hbDown',
                    hidden      : true,
                    disabled    : true,
                    items       : [
                        {
                            xtype       : 'displayfield',
                            width       : 180,
                            margin      : '15 0 0 15',
                            labelClsExtra   : 'lblRdReq',
                            padding     : 0,
                            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down Mb/s",
                            value       : 1
                        },
                        {
		                    xtype       : 'sliderfield',
                            name        : 'xwf_bw_down',
                            userCls     : 'sldrDark',
                            itemId      : 'sldrSpeedDown',
                            flex        : 1,
                            increment   : 1,
                            minValue    : 1,
                            maxValue    : 10,
                            listeners   : {
				                change      : 'sldrSpeedDownChange',
				                afterrender : 'sldrSpeedDownChange'
			                }
                        }
                    ]
                },
                {
		            xtype       : 'container',
                    layout      : 'hbox',
                    itemId      : 'hbUp',
                    hidden      : true,
                    disabled    : true,
                    items       : [
                        {
                            xtype       : 'displayfield',
                            width       : 180,
                            margin      : '15 0 0 15',
                            labelClsExtra   : 'lblRdReq',
                            padding     : 0,
                            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up Mb/s",
                            value       : 1
                        },
                        {
		                    xtype       : 'sliderfield',
                            name        : 'xwf_bw_up',
                            userCls     : 'sldrDark',
                            itemId      : 'sldrSpeedUp',
                            flex        : 1,
                            increment   : 1,
                            minValue    : 1,
                            maxValue    : 10,
                            listeners   : {
				                change      : 'sldrSpeedUpChange',
				                afterrender : 'sldrSpeedUpChange'
			                }
                        }
                    ]
                }                 
            ]
        };
        
        if(me.xwf_enabled){     
            //cp_tabs.push(t_xwf);
        }
        
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                //maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType         : 'textfield',
            buttons : [
                 {
                    itemId      : 'btnDataPrev',
                    text        : i18n('sPrev'),
                    scale       : 'large',
                    iconCls     : 'b-prev',
                    glyph       : Rd.config.icnBack,
                    margin      : Rd.config.buttonMargin
                },
                {
                    itemId      : 'save',
                    text        : i18n('sOK'),
                    scale       : 'large',
                    iconCls     : 'b-btn_ok',
                    glyph       : Rd.config.icnNext,
                    formBind    : true,
                    margin      : Rd.config.buttonMargin
                }
            ],
            items:[
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            'title'     : i18n('sCommon_settings'),
                            'layout'    : 'anchor',
                            itemId      : 'tabRequired',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    itemId  : 'mesh_id',
                                    xtype   : 'textfield',
                                    name    : "mesh_id",
                                    hidden  : true,
                                    value   : me.meshId
                                }, 
                                {
                                    itemId  : 'type',
                                    xtype   : 'textfield',
                                    name    : 'type',
                                    hidden  : true
                                }, 
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sAuto_detect'),
                                    name        : 'auto_detect',
                                    inputValue  : 'auto_detect',
                                    checked     : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'vlan',
                                    itemId      : 'vlan',
                                    fieldLabel  : i18n('sVLAN_number'),
                                    value       : 0,
                                    maxValue    : 4095,
                                    step        : 1,
                                    minValue    : 0,
                                    labelClsExtra: 'lblRdReq',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value")
                                },
                                tagConnectWith,
                                {
                                    itemId      : 'chkNasClient',
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Add Dynamic RADIUS Client',
                                    name        : 'auto_dynamic_client',
                                    inputValue  : 'auto_dynamic_client',
                                    checked     : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'cmbRealm',
                                    xtype       : 'cmbRealm',
                                    multiSelect : true,
                                    typeAhead   : false,
                                    allowBlank  : true,
                                    name        : 'realm_ids[]',
                                    emptyText   : 'Empty = Any Realm',
                                    blankText   : 'Empty = Any Realm'
                                },
                                {
                                    itemId      : 'chkLoginPage',
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Add Login Page',
                                    name        : 'auto_login_page',
                                    inputValue  : 'auto_login_page',
                                    checked     : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'cmbDynamicDetail',
                                    xtype       : 'cmbDynamicDetail',
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'cmbOpenVpnServers',
                                    xtype       : 'cmbOpenVpnServers',
                                    labelClsExtra: 'lblRdReq',
                                    allowBlank  : false
                                },
                                //-----------------------------
                                //-Layer 3 Tagged VLAN Options-
                                // #rgrpProtocol #txtIpaddr #txtNetmask #txtGateway #txtDns1 #txtDns2
                                //-----------------------------
                                {
                                    xtype       : 'radiogroup',
                                    fieldLabel  : 'Protocol',
                                    vertical    : true,
                                    itemId      : 'rgrpProtocol',
                                    labelClsExtra: 'lblRdReq',
                                    listeners   : {
							            change  : 'onRgrpProtocolChange'
							        },
                                    items: [
                                        { boxLabel: 'DHCP',     name: 'proto', inputValue: 'dhcp', checked: true },
                                        { boxLabel: 'Static',   name: 'proto', inputValue: 'static'}
                                    ]
                                },
                                {
                                    itemId      : 'txtIpaddr',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : 'ipaddr',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    vtype       : 'IPAddress'
                                },
                                {
                                    itemId      : 'txtNetmask',
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Netmask',
                                    name        : 'netmask',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    vtype       : 'IPAddress'
                                },
                                {
                                    itemId      : 'txtGateway',
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Gateway',
                                    name        : 'gateway',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    vtype       : 'IPAddress'
                                },
                                {
                                    itemId      : 'txtDns1Tagged',
                                    xtype       : 'textfield',
                                    fieldLabel  : 'DNS PrimarytxtDns1',
                                    name        : 'dns_1',
                                    allowBlank  : true,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRd',
                                    vtype       : 'IPAddress'
                                },
                                {
                                    itemId      : 'txtDns2Tagged',
                                    xtype       : 'textfield',
                                    fieldLabel  : 'DNS Secondary',
                                    name        : 'dns_2',
                                    allowBlank  : true,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRd',
                                    vtype       : 'IPAddress'
                                }
                            ]
                        },

                        //---- Captive Protal ----
                        { 
                            title       : i18n('sCaptive_Portal_settings'),
                            layout      : 'fit',
                            disabled    : true,
                            itemId      : 'tabCaptivePortal',
                            items       : [ 
                                {
                                    xtype   : 'tabpanel',
                                    layout  : 'fit',
                                    margins : '0 0 0 0',
                                    plain   : true,
                                    tabPosition: 'top',
                                    cls     : 'subTab',
                                    border  : false,
                                    items   : cp_tabs
                                }
                            ]
                        },
                        //--- End Captive Portal ---
                        {                            
                            title       : 'NAT+DHCP Specific',
                            glyph       : Rd.config.icnAccessPoint,
                            itemId      : 'tabNatDhcp',
                            disabled    : false,
                            hidden		: false,
                            scrollable  : 'y',
                            items       : [
                                {
                                    xtype   : 'pnlExitPointNatDhcp',
                                    auto_chk: true
                                }                           
                            ]
                        }  
                    ]
                }
            ]
        });
        return frmData;
    }   


});
