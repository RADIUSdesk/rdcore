Ext.define('Rd.view.meshes.winMeshEditExit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMeshEditExit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      i18n('sEdit_mesh_exit_point'),
    width:      600,
    height:     530,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'edit',
    glyph: Rd.config.icnEdit,
    autoShow:   false,
    meshId:    '',
    exitId:     '',
    store:      undefined,
    defaults: {
            border: false
    },
    listeners   : {
        afterrender : 'onAfterRender',
        beforeshow  : 'loadExit'
    },
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.meshes.cmbEncryptionOptions',
        'Rd.store.sEncryptionOptions',
        'Rd.model.mEncryptionOption',
        'Rd.view.components.cmbOpenVpnServers',
        'Rd.view.meshes.vcMeshExitPoint',
        'Rd.view.meshes.cmbMeshUpstreamList',
        'Rd.view.meshes.tagMeshEntryPoints',
        'Rd.view.meshes.cmbTrafficClasses',
        'Rd.view.meshes.cmbHomeServerPools',
        'Rd.view.components.pnlExitPointNatDhcp'
    ],
    controller  : 'vcMeshExitPoint',
    initComponent: function() {
        var me = this;

        //Set the combo
        var tagConnectWith = Ext.create('Rd.view.meshes.tagMeshEntryPoints',{
            labelClsExtra   : 'lblRdReq'
        });

		var hide_cp = true;
		if(me.type == 'captive_portal'){
			hide_cp = false;
		}
		
		var hide_nat = true;
		if(me.type == 'nat'){
			hide_nat = false;
		}
 
        tagConnectWith.getStore().getProxy().setExtraParam('mesh_id',me.meshId);
        tagConnectWith.getStore().getProxy().setExtraParam('exit_id',me.exitId);
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
                allowBlank  : false,
                labelClsExtra: 'lblRdReq'
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
                autoScroll  : true,
                items       : basic_t_items
            },
            {
                title       : 'DNS',
                itemId      : 'tabDns',
                layout      : 'anchor',
                defaults    : {
                        anchor: '100%'
                },
                autoScroll:true,
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
            autoScroll  :true,
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
                    hidden      : true,
                    disabled    : true
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
                msgTarget   : 'under',
                labelClsExtra: 'lblRd',
                labelAlign  : 'left',
                labelSeparator: '',
                labelClsExtra: 'lblRd',
                labelWidth  : Rd.config.labelWidth,
                margin      : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'save',
                    text: i18n('sOK'),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin: Rd.config.buttonMargin
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
                                    itemId  : 'id',
                                    xtype   : 'textfield',
                                    name    : 'id',
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
                                    fieldLabel  : 'DNS Primary',
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
                            hidden		: hide_cp,
                            items       : [ 
                                {
                                    xtype   : 'tabpanel',
                                    layout  : 'fit',
                                    xtype   : 'tabpanel',
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
                            disabled    : hide_nat,
                            hidden		: hide_nat,
                            scrollable  : 'y',
                            items       : [
                                {
                                    xtype   : 'pnlExitPointNatDhcp'
                                }                           
                            ]
                        }
                    ]
                }
            ]
        });

        //Should we enable or disable the captive portal tab
        var tab_capt= frmData.down('#tabCaptivePortal');
        if(me.type == 'captive_portal'){
            tab_capt.setDisabled(false);
        }else{
            tab_capt.setDisabled(true); 
        }

        me.items = frmData;
        me.callParent(arguments);
    }
});
