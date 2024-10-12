Ext.define('Rd.view.multiWanProfiles.pnlMultiWanProfileInterfaceAddEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlMultiWanProfileInterfaceAddEdit',
    closable    : true,
    realm_id    : null,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    multi_wan_profile_id : '',
    multi_wan_profile_name : '',
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
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.multiWanProfiles.vcMultiWanProfileInterface',
        'Rd.view.components.cmbSqmProfile',
    ],
    controller  : 'vcMultiWanProfileInterface',
    initComponent: function() {
        var me 		= this; 
        me.setTitle('Add Interface For '+me.multi_wan_profile_name);
        
        var w_prim  = 550;
        var w_sec   = w_prim - 30;
     
        var pnlStatic = {
            xtype       : 'panel',
            itemId      : 'pnlStatic',
            hidden      : true,
            disabled    : true,
            bodyStyle   : 'background: #e0ebeb',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items   : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : 'static_ipaddr',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Netmask',
                    name        : 'static_netmask',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Gateway',
                    name        : 'static_gateway',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'static_dns_1',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'static_dns_2',
                    allowBlank  : true,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress'
                }
            ]
        };
        
        var pnPppoe = {
            xtype       : 'panel',
            itemId      : 'pnlPppoe',
            hidden      : true,
            disabled    : true,
            bodyStyle   : 'background: #e0ebeb',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items   : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Username',
                    name        : 'pppoe_username',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'rdPasswordfield',
                    rdName      : 'pppoe_password',
                    rdLabel     : 'Password',
                    enabled     : true
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Primary',
                    name        : 'pppoe_dns_1',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'DNS Secondary',
                    name        : 'pppoe_dns_2',
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRd',
                    vtype       : 'IPAddress'
                },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'My Own MAC',
			        name        : 'pppoe_mac',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'MacAddress',
			        labelClsExtra: 'lblRd',
			        fieldStyle  : 'text-transform:uppercase'
		        },
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'MTU',
			        name        : 'pppoe_mtu',
			        blankText   : i18n("sSupply_a_value"),
			        vtype       : 'Numeric',
			        labelClsExtra: 'lblRd'
		        }       
            ]
        };
        
        var pnlQmi = {
            xtype       : 'panel',
            itemId      : 'pnlQmi',
            hidden      : true,
            disabled    : true,
            bodyStyle   : 'background: #e0ebeb',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items   : [               
                { 
                    xtype       : 'cmbQmiAuth',
                    allowBlank  : false,
                    name        : 'qmi_auth',
                    listeners       : {
						    change : 'onCmbQmiOptionsChange'
				    }  
                },       
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Username',
                    name        : 'qmi_username',
                    itemId      : 'qmi_username',
                    hidden      : true,
                    disabled    : true,
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Password',
                    name        : 'qmi_password',
                    itemId      : 'qmi_password',
                    hidden      : true,
                    disabled    : true,
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'APN',
                    name        : 'qmi_apn',
                    labelClsExtra: 'lblRd'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Pincode',
                    name        : 'qmi_pincode',
                    labelClsExtra: 'lblRd'
                }
            ]
        };
        
        var pnlWifi = {
            xtype       : 'panel',
            itemId      : 'pnlWifi',
            hidden      : true,
            disabled    : true,
            bodyStyle   : 'background: #e0ebeb',
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items   : [         
                {
                    fieldLabel  : 'SSID',
                    name        : 'wbw_ssid',
                    maxLength   : 31,
                    allowBlank  : false,
                    regex       : /^[\w\-\s]+$/,
                    regexText   : "Only words allowed",
                    emptyText   : 'Specify a value to continue',
                    width       : w_prim,
                    xtype       : 'textfield'
                }, 
                { 
                    xtype       : 'cmbEncryptionOptionsSimple',
                    allowBlank  : false,
                    name        : 'wbw_encryption',
                    width       : w_prim,
                    listeners       : {
						   // change : 'onCmbEncryptionOptionsChangeWbw'
				    }  
                },
                {
                    fieldLabel  : 'Passphrase',
                    name        : 'wbw_key',
                    itemId      : 'wbw_key',
                    allowBlank  : false,
                    xtype       : 'textfield',
                    width       : w_prim,
                    minLength   : 8,
                    hidden      : true,
                    disabled    : true
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Radio',
                    itemId      : 'rgrpWbWradio',
                    columns     : 3,
                    vertical    : false,
                    items       : [                        
                        {
                            boxLabel  : 'Radio0',
                            name      : 'wbw_device',
                            inputValue: 'radio0',
                            itemId    : 'wbw_radio_0',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Radio1',
                            name      : 'wbw_device',
                            inputValue: 'radio1',
                            itemId    : 'wbw_radio_1',
                            margin    : '0 0 0 15'
                        },
                        { 
                            boxLabel  : 'Radio2',
                            name      : 'wbw_device',
                            inputValue: 'radio2',
                            itemId    : 'wbw_radio_2',
                            margin    : '0 0 0 15'
                        }    
                    ]
                }
            ]
        };
        
        var cntGeneral = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    name        : 'interface_name',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                }
            ]
        }
        
        var cntConnection = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype   : 'textfield',
                    name    : 'multi_wan_profile_id',
                    value   : me.multi_wan_profile_id,
                    hidden  : true
                },
                {
                    xtype   : 'textfield',
                    name    : 'type',
                    itemId	: 'txtType',
                    hidden  : true,
                    value	: 'ethernet'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Type',
                    labelClsExtra: 'lblRd',
                    layout: {
				        type	: 'hbox',
				        align	: 'middle',
				        pack	: 'stretchmax',
				        padding	: 0,
				        margin	: 0
			        },
                    defaultType: 'button',
    				defaults: {
				        enableToggle: true,
				        toggleGroup: 'type',
				        allowDepress: false,					
			        },             
                    items: [
				        { text: 'Ethernet', 	itemId: 'btnEthernet',  glyph: Rd.config.icnSitemap,    flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true },
				        { text: 'LTE', 		    itemId: 'btnLte',       glyph: Rd.config.icnWifi,       flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 5' },
				        { text: 'WiFi', 	    itemId: 'btnWifi',      glyph: Rd.config.icnSsid,       flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5' }
			        ]
                },
                pnlQmi,
                pnlWifi,
                {
                    xtype   : 'textfield',
                    name    : 'protocol',
                    itemId	: 'txtProtocol',
                    hidden  : true,
                    value	: 'ipv4'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Protocol',
                    labelClsExtra: 'lblRd',
                    layout: {
				        type	: 'hbox',
				        align	: 'middle',
				        pack	: 'stretchmax',
				        padding	: 0,
				        margin	: 0
			        },
                    defaultType: 'button',
    				defaults: {
				        enableToggle: true,
				        toggleGroup: 'protocol',
				        allowDepress: false,					
			        },             
                    items: [
				        { text: 'IPv4', 	itemId: 'btnIpv4',    flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true  },
				        { text: 'IPv6',     itemId: 'btnIPv6',    flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5', disabled: true }
			        ]
                },
                 {
                    xtype   : 'textfield',
                    name    : 'method',
                    itemId	: 'txtMethod',
                    hidden  : true,
                    value	: 'ipv4'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Method',
                    itemId      : 'rgrpMethod',
                    labelClsExtra: 'lblRd',
                    layout: {
				        type	: 'hbox',
				        align	: 'middle',
				        pack	: 'stretchmax',
				        padding	: 0,
				        margin	: 0
			        },
                    defaultType: 'button',
    				defaults: {
				        enableToggle: true,
				        toggleGroup: 'method',
				        allowDepress: false,					
			        },             
                    items: [
				        { text: 'DHCP', 	itemId: 'btnDhcp',  flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true },
				        { text: 'Static IP Address', itemId: 'btnStatic', flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 5' },
				        { text: 'PPPoE', 	itemId: 'btnPppoe',  flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5' }
			        ]
                },
                pnlStatic,
                pnPppoe,
                {
                    xtype       : 'numberfield',
                    name        : 'metric',
                    fieldLabel  : 'Metric',
                    allowBlank  : true,
                    maxValue    : 300,
                    minValue    : 1,
                    value       : 1,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                },
                {
                    xtype       : 'numberfield',
                    name        : 'vlan',
                    itemId      : 'nrVlan',
                    fieldLabel  : 'VLAN',
                    allowBlank  : true,
                    maxValue    : 4094,
                    minValue    : 1,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                }, 
                {
                    xtype       : 'textfield',
                    itemId      : 'txtHardwarePort',
                    fieldLabel  : 'Hardware Port',
                    name        : 'hardware_port',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },                        
                {
                    itemId      : 'chkApplySqmProfile',
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Apply SQM Profile',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'apply_sqm_profile',
                    listeners   : {
			            change  : 'onChkApplySqmProfileChange'
			        }
                },
                {
                	xtype		: 'cmbSqmProfile',
                	fieldLabel	: 'SQM Profile',
                	include_all_option : false,
                	disabled	: true,
                	labelClsExtra: 'lblRd'                             	
                }              
            ]
        } 
        
        var cntMonitor = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Enable Monitor',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'enable_monitor',
                    listeners   : {
			          //  change  : 'onChkApplySqmProfileChange'
			        }
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Host / IP  1',
                    name        : 'monitor_host_1',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                }, 
                { xtype : 'button', text: 'ADD HOST / IP ADDRESS', 	itemId: 'btnAddHost',  flex:1, ui : 'default-toolbar', 'margin' : '10' },
                {
                    xtype       : 'numberfield',
                    name        : 'reliability',
                    fieldLabel  : 'Reliability',
                    allowBlank  : true,
                    maxValue    : 1,
                    minValue    : 1,
                    value       : 1,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                },
                {
                    xtype       : 'numberfield',
                    name        : 'ping_count',
                    fieldLabel  : 'Ping Count',
                    allowBlank  : true,
                    maxValue    : 10,
                    minValue    : 1,
                    value       : 1,
                    labelClsExtra : 'lblRd',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                }           
            ]
        }            
       
        me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntGeneral			
            },
            {
                xtype       : 'panel',
                title       : 'Connection',
                glyph       : Rd.config.icnPlug, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntConnection				
            },
            {
                xtype       : 'panel',
                title       : 'Monitor',
                glyph       : Rd.config.icnHeartbeat, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntMonitor				
            }
        ];      
               
        me.callParent(arguments);
    }
});
