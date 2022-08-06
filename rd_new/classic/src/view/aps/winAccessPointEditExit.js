Ext.define('Rd.view.aps.winAccessPointEditExit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winAccessPointEditExit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'Access Point Exit',
    width:      600,
    height:     530,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'edit',
    glyph:      Rd.config.icnEdit,
    autoShow:   false,
    apProfileId:    '',
    exitId:     '',
    store:      undefined,
    defaults: {
            border: false
    },
    listeners   : {
		beforeshow  : 'loadExit'
	},
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.cmbDynamicDetail',
        'Rd.view.components.cmbOpenVpnServers',
        'Rd.view.aps.vcAccessPointExitPoint',
        'Rd.view.aps.cmbApProfileUpstreamList',
        'Rd.view.aps.tagAccessPointEntryPoints',
        'Rd.view.components.pnlExitPointNatDhcp'
    ],
    controller  : 'vcAccessPointExitPoint',
    initComponent: function() {
        var me = this;

        //Set the combo
        var tagConnectWith = Ext.create('Rd.view.aps.tagAccessPointEntryPoints',{
            labelClsExtra   : 'lblRdlReq'
        });

		var hide_cp = true;
		if(me.type == 'captive_portal'){
			hide_cp = false;
		}
		
		var hide_nat = true;
		if(me.type == 'nat'){
			hide_nat = false;
		}
 
        tagConnectWith.getStore().getProxy().setExtraParam('ap_profile_id',me.apProfileId);
        tagConnectWith.getStore().getProxy().setExtraParam('exit_id',me.exitId);
        tagConnectWith.getStore().load();
        var w_prim         = 550;
        
        var pnlLayer3Detail = {
            xtype   : 'panel',
            itemId  : 'pnlLayer3Detail',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    itemId      : 'txtIpaddr',
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : 'ipaddr',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress',
                    width       : w_prim
                },
                {
                    itemId      : 'txtNetmask',
                    xtype       : 'textfield',
                    fieldLabel  : 'Netmask',
                    name        : 'netmask',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress',
                    width       : w_prim
                },
                {
                    itemId      : 'txtGateway',
                    xtype       : 'textfield',
                    fieldLabel  : 'Gateway',
                    name        : 'gateway',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress',
                    width       : w_prim
                },
                {
                    itemId      : 'txtDns1Tagged',
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'dns_1',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress',
                    width       : w_prim
                },
                {
                    itemId      : 'txtDns2Tagged',
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'dns_2',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress',
                    width       : w_prim
                }     
            ]
        };
 
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
                labelWidth      : Rd.config.labelWidth,
                //maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId  : 'save',
                    text    : i18n("sOK"),
                    scale   : 'large',
                    formBind: true,
                    glyph   : Rd.config.icnYes,
                    margin  : Rd.config.buttonMargin
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
                            title       : 'Common Settings',
                            glyph       : Rd.config.icnGears,
                            layout      : 'anchor',
                            itemId      : 'tabRequired',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    itemId  : 'ap_profile_id',
                                    xtype   : 'textfield',
                                    name    : "ap_profile_id",
                                    hidden  : true,
                                    value   : me.apProfileId
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
                                    xtype       : 'numberfield',
                                    name        : 'vlan',
                                    itemId      : 'vlan',
                                    fieldLabel  : i18n("sVLAN_number"),
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
                                    fieldLabel  : 'Auto-add Dynamic RADIUS Client',
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
                                    fieldLabel  : 'Auto-add Login Page',
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
                                // #rgrpProtocol #pnlLayer3Detail
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
                                pnlLayer3Detail
                            ]
                        },
                        //---- Captive Protal ----
                        { 
                            title       : i18n("sCaptive_Portal_settings"),
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
                                    cls     : 'subTab',
                                    tabPosition: 'top',
                                    border  : false,
                                    items   :  [
                                        {
                                            title       : i18n("sBasic"),
                                            layout      : 'anchor',
                                            defaults    : {
                                                anchor: '100%'
                                            },
                                            autoScroll:true,
                                            items       :[
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sRADIUS_server1"),
                                                    name        : 'radius_1',
                                                    allowBlank  : false,
                                                    blankText   : i18n("sSupply_a_value"),
                                                    labelClsExtra: 'lblRdReq'
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sRADIUS_server2"),
                                                    name        : 'radius_2',
                                                    allowBlank  : true,
                                                    labelClsExtra: 'lblRd'
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sRADIUS_secret"),
                                                    name        : 'radius_secret',
                                                    allowBlank  : false,
                                                    labelClsExtra: 'lblRdReq'
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sUAM_URL"),
                                                    name        : 'uam_url',
                                                    allowBlank  : false,
                                                    labelClsExtra: 'lblRdReq',
                                                    emptyText   : 'http://your_ip_here/cake3/rd_cake/dynamic-details/chilli-browser-detect/',
                                                    blankText   : 'Try http://your_ip_here/cake3/rd_cake/dynamic-details/chilli-browser-detect/'
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sUAM_Secret"),
                                                    name        : 'uam_secret',
                                                    labelClsExtra: 'lblRd'
                                                },
                                                {
                                                    xtype       : 'textareafield',
                                                    grow        : true,
                                                    fieldLabel  : i18n("sWalled_garden"),
                                                    name        : 'walled_garden',
                                                    anchor      : '100%',
                                                    allowBlank  : true,
                                                    labelClsExtra: 'lblRd'
                                                 },
                                                 {
                                                    xtype       : 'checkbox',      
                                                    fieldLabel  : i18n("sSwap_octets"),
                                                    name        : 'swap_octet',
                                                    inputValue  : 'swap_octet',
                                                    checked     : true,
                                                    labelClsExtra: 'lblRdReq'
                                                },
                                                {
                                                    xtype       : 'checkbox',      
                                                    fieldLabel  : i18n("sMAC_authentication"),
                                                    name        : 'mac_auth',
                                                    inputValue  : 'mac_auth',
                                                    checked     : true,
                                                    labelClsExtra: 'lblRdReq'
                                                }
                                            ]
                                        },
                                        {
                                            title       : 'DNS',
                                            itemId      : 'tabDns',
                                            layout      : 'anchor',
                                            defaults    : {
                                                    anchor: '100%'
                                            },
                                            autoScroll:true,
                                            items       :[
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
                                                    fieldLabel  : 'Use DNSdesk',
                                                    name        : 'dnsdesk',
                                                    inputValue  : 'dnsdesk',
                                                    checked     : false,
                                                    labelClsExtra: 'lblRd',
                                                    listeners   : {
											            change  : 'onChkDnsDeskChange',
											            beforerender : 'onDnsDeskBeforeRender'
											        }
                                                }
                                            ]
                                        }, 
                                        {
                                            title       : i18n("sProxy"),
                                            itemId      : 'tabProxy',
                                            layout      : 'anchor',
                                            defaults    : {
                                                    anchor: '100%'
                                            },
                                            autoScroll:true,
                                            items       :[
                                                {
                                                    itemId      : 'chkProxyEnable',
                                                    xtype       : 'checkbox',      
                                                    fieldLabel  : i18n("sEnable"),
                                                    name        : 'proxy_enable',
                                                    inputValue  : 'proxy_enable',
                                                    checked     : false,
                                                    labelClsExtra: 'lblRdReq'
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sUpstream_proxy"),
                                                    name        : 'proxy_ip',
                                                    allowBlank  : false,
                                                    labelClsExtra: 'lblRdReq',
                                                    disabled    : true
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sUpstream_port"),
                                                    name        : 'proxy_port',
                                                    allowBlank  : false,
                                                    labelClsExtra: 'lblRdReq',
                                                    disabled    : true
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sAuth_name"),
                                                    name        : 'proxy_auth_username',
                                                    allowBlank  : true,
                                                    labelClsExtra: 'lblRd',
                                                    disabled    : true
                                                },
                                                {
                                                    xtype       : 'textfield',
                                                    fieldLabel  : i18n("sAuth_password"),
                                                    name        : 'proxy_auth_password',
                                                    allowBlank  : true,
                                                    labelClsExtra: 'lblRd',
                                                    disabled    : true
                                                }
                                            ]
                                        }, 
                                        {
                                            title       : i18n("sCoova_specific"),
                                            layout      : 'anchor',
                                            defaults    : {
                                                    anchor: '100%'
                                            },
                                            autoScroll:true,
                                            items       :[
                                                {
                                                    xtype       : 'textareafield',
                                                    grow        : true,
                                                    fieldLabel  : i18n("sOptional_config_items"),
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
                                                   xtype            : 'cmbApProfileUpstreamList',
                                                   ap_profile_id    : me.apProfileId,
                                                   labelClsExtra    : 'lblRdReq',
                                                   value            : 0
                                                }     
                                            ]
                                        }
                                    ]
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
        
        var a_nas   = frmData.down('#chkNasClient');
        var a_page  = frmData.down('#chkLoginPage');
        var cmb_page= frmData.down('cmbDynamicDetail');
        
        if(me.type == 'captive_portal'){
            tab_capt.setDisabled(false);
            a_nas.setVisible(true);
            a_nas.setDisabled(false);
            a_page.setVisible(true);
            a_page.setDisabled(false);
            cmb_page.setVisible(true);
            cmb_page.setDisabled(false);
              
        }else{
            tab_capt.setDisabled(true); 
            a_nas.setVisible(false);
            a_nas.setDisabled(true);
            a_page.setVisible(false);
            a_page.setDisabled(true);
            cmb_page.setVisible(false);
            cmb_page.setDisabled(true);
        }

        me.items = frmData;
        me.callParent(arguments);
    }
});
