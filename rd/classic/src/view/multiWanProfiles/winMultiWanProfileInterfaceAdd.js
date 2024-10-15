Ext.define('Rd.view.multiWanProfiles.winMultiWanProfileInterfaceAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMultiWanProfileInterfaceAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Interface',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    multi_wan_profile_id : '',
    multi_wan_profile_name : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.multiWanProfiles.vcMultiWanProfileInterface',
       // 'Rd.view.components.cmbConnectionMethods',
        'Rd.view.components.cmbSqmProfile',
    ],
    controller  : 'vcMultiWanProfileInterface',
    initComponent: function() {
        var me 		= this; 
        me.setTitle('Add Interface For '+me.multi_wan_profile_name);
        
        var pnlStatic = {
            xtype   : 'panel',
            itemId  : 'pnlStatic',
            hidden  : true,
            disabled: true,
            layout  : 'anchor',
            defaults	: {
                anchor: '100%'
            },
            bodyStyle   : 'background: #e0ebeb',
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
            xtype   : 'panel',
            itemId  : 'pnlPppoe',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            layout  : 'anchor',
            defaults	: {
                anchor: '100%'
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
            xtype   : 'panel',
            itemId  : 'pnlQmi',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            layout  : 'anchor',
            defaults	: {
                anchor: '100%'
            },
            items   : [               
                { 
                    xtype       : 'cmbQmiAuth',
                    allowBlank  : false,
                    name        : 'qmi_auth',
                    width       : w_prim,
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
                },
                {
                    xtype       : 'cmbApExits',
                    fieldLabel  : 'Bridge WAN Port',
                    name        : 'qmi_wan_bridge',
                    itemId      : 'qmi_wan_bridge'
                }
            ]
        };
                               
        var frmData = Ext.create('Ext.form.Panel',{
            border		: false,      
            layout: {
                type    : 'vbox',
                align   : 'stretch',
                pack    : 'start'
            },
            autoScroll	: true,
            defaults	: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                margin          : 15
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId  :  'save',
                    text    : i18n('sOK'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items: [
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    name        : 'interface_name',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                }, 
                {
                    xtype   : 'panel',
                    ui      : 'panel-blue',
                    title   : 'Connection',
                    glyph   : Rd.config.icnPlug,
                    layout  : 'anchor',
                    margin  : 5,
                    defaults	: {
                        anchor: '100%'
                    },
                    items   : [
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
                }, 
                {
                    xtype   : 'panel',
                    ui      : 'panel-blue',
                    title   : 'Monitor',
                    glyph   : Rd.config.icnHeartbeat,
                    layout  : 'anchor',
                    margin  : 5,
                    defaults	: {
                        anchor: '100%'
                    },
                    items   : [
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
                        { xtype : 'button', text: 'ADD HOST / IP ADDRESS', 	itemId: 'btnAddHost',  flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 0' },
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
            ]
        });
        
        me.items = frmData;
        me.callParent(arguments);
    }
});
