Ext.define('Rd.view.meshes.pnlNodeCommonSettings', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlNodeCommonSettings',
     requires   : [
        'Rd.view.aps.vcAccessPointCommonSettings'
    ],
    controller  : 'vcAccessPointCommonSettings',
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
        labelClsExtra   : 'lblRd'
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
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.cmbCountries',      
        'Rd.view.components.cmbTimezones',
        'Rd.view.components.rdPasswordfield',
        'Rd.view.components.cmbSchedule'
    ],
    initComponent: function(){
        var me          = this;
        var w_prim      = 550;
        var w_rb        = 75; 
        
        var store_proto = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"http", "name":"HTTP"},
                {"id":"https", "name":"HTTPS"}
            ]
        });
        
        var cntSystem  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype   : 'rdPasswordfield'
                },
                {
                    xtype       : 'cmbCountries',
                    anchor      : '100%'
                },
                {
                    xtype       : 'cmbTimezones',
                    anchor      : '100%'
                },
                {
                    xtype       : 'checkbox',      
                    name        : 'enable_schedules',
                    inputValue  : '1',
		            itemId		: 'chkEnableSchedules',
                    checked     : false,
                    boxLabel    : 'Apply schedule',
                    boxLabelCls : 'boxLabelRd'
                },
                {
                    xtype   : 'panel',
                    itemId  : 'cntSchedule',
                    hidden  : true,
                    disabled: true,
                    bodyStyle   : 'background: #e0ebeb',
                    items   : [
                         {
                            xtype       : 'cmbSchedule',
                            labelClsExtra: 'lblRdReq',
                            width       : 465
                        }    
                    ]
                }         
            ]
        }
        
        var cntWifi  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'numberfield',
                    anchor      : '100%',
                    name        : 'two_chan',
                    fieldLabel  : i18n('s2_pt_4G_Channel'),
                    value       : 5,
                    maxValue    : 14,
                    minValue    : 1,
                    allowBlank  : false
                },
                {
                    xtype       : 'cmbFiveGigChannels',
                    anchor      : '100%',
                    allowBlank  : false
                },
                {
                    xtype       : 'rdPasswordfield',
                    rdName      : 'client_key',
                    rdLabel     : 'Client key',
                    rdMinLength : 8
                }        
            ]
        }
        
         var cntBridge = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'checkbox',      
                    name        : 'eth_br_chk',
                    inputValue  : 'eth_br_chk',
		            itemId		: 'eth_br_chk',
                    checked     : false,
                    boxLabel    : 'Bridge Repeater WAN',
                    boxLabelCls : 'boxLabelRd'
                },
	            {
		            xtype		: 'cmbEthBridgeOptions',
		            meshId		: me.meshId,
		            disabled	: true
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
                    xtype       : 'combobox',
                    fieldLabel  : 'Protocol',
                    store       : store_proto,
                    queryMode   : 'local',
                    name        : 'report_adv_proto',
                    displayField: 'name',
                    valueField  : 'id',
                    value       : 'http'
                },
                {
                    xtype       : 'component',
                    html        : 'Values in seconds',
                    cls         : 'heading',
                    margin      : '20 0 0 0',
                    width       : w_prim+20
                }, 
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_light',
                    itemId      : 'report_adv_light',
                    fieldLabel  : 'Light report interval',
                    value       : 60,
                    maxValue    : 21600,
                    minValue    : 60,
                    allowBlank  : false
                },
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_full',
                    itemId      : 'report_adv_full',
                    fieldLabel  : 'Full report interval',
                    value       : 600,
                    maxValue    : 21600,
                    minValue    : 300,
                    allowBlank  : false
                },
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_sampling',
                    itemId      : 'report_adv_sampling',
                    fieldLabel  : 'Sampling interval',
                    value       : 60,
                    maxValue    : 21600,
                    minValue    : 60,
                    allowBlank  : false
                },
                {
                    xtype       : 'numberfield',
                    name        : 'heartbeat_dead_after',
                    itemId      : 'heartbeat_dead_after',
                    fieldLabel  : 'Heartbeat dead after',
                    value       : 600,
                    maxValue    : 21600,
                    minValue    : 300,
                    allowBlank  : false
                }        
            ]
        };
               
        var cntGateway = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'numberfield',
                    name        : 'gw_dhcp_timeout',
                    itemId      : 'gw_dhcp_timeout',
                    fieldLabel  : 'Wait for DHCP IP',
                    value       : 60,
                    maxValue    : 600,
                    minValue    : 30,
                    allowBlank  : false
                },
                {
                    xtype       : 'checkbox',      
                    name        : 'gw_use_previous',
                    inputValue  : 'gw_use_previous',
		            itemId		: 'gw_use_previous',
                    checked     : true,
                    boxLabel    : 'Use previous settings when DHCP fails',
                    boxLabelCls : 'boxLabelRd'
                },  
                {
                    xtype       : 'checkbox',      
                    name        : 'gw_auto_reboot',
                    inputValue  : 'gw_auto_reboot',
		            itemId		: 'gw_auto_reboot',
                    checked     : true,
                    boxLabel    : 'Reboot node if gateway is unreachable',
                    boxLabelCls : 'boxLabelRd'
                },     
                {
                    xtype       : 'numberfield',
                    name        : 'gw_auto_reboot_time',
                    itemId      : 'gw_auto_reboot_time',
                    fieldLabel  : 'Reboot trigger time',
                    value       : 600,
                    maxValue    : 3600,
                    minValue    : 240,
                    allowBlank  : false
                }      
            ]
        }

         var cntVlans = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            margin      : 0,
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                 {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Enable',
                    name        : 'vlan_enable',
                    inputValue  : '1',
		            itemId		: 'chkEnableDynamicVlans',
                    checked     : false,
                    listeners   : {
		                change  : 'OnChkVlanEnableChange'
	                }
                },
                {
                    xtype       : 'radiogroup',
                    itemId      : 'rgrpVlanRangeOrList',
                    disabled    : true,
                    fieldLabel  : 'VLANs Used',
                    labelWidth  : Rd.config.labelWidth+18,
                    columns     : 2,
                    vertical    : false,
                    items       : [
                        {
                            boxLabel  : 'Range',
                            name      : 'vlan_range_or_list',
                            inputValue: 'range',
                            margin    : '0',
                            width     : w_rb,
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'List',
                            name      : 'vlan_range_or_list',
                            inputValue: 'list',
                            margin    : '0 0 0 0',
                            width     : w_rb
                        }
                    ],
                    listeners   : {
				        change  : 'rgrpVlanChange'
			        }
                },
                {
                    xtype       : 'numberfield',
                    name        : 'vlan_start',
                    itemId      : 'vlan_start',
                    fieldLabel  : 'VLAN Start',
                    disabled    : true,
                    value       : 100,
                    maxValue    : 4094,
                    allowBlank  : false,
                    minValue    : 1
                },
                {
                    xtype       : 'numberfield',
                    name        : 'vlan_end',
                    itemId      : 'vlan_end',
                    disabled    : true,
                    fieldLabel  : 'VLAN End',
                    value       : 101,
                    maxValue    : 4094,
                    allowBlank  : false,
                    minValue    : 2
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'VLAN List',
                    name        : "vlan_list",
                    itemId      : 'vlan_list',
                    disabled    : true,
                    hidden      : true,
                    allowBlank  : false,
                    blankText   : 'Comma Separated List',
                }                
            ]
        }
        
        me.items = [
            {
                xtype       : 'panel',
                title       : 'System',
                glyph       : Rd.config.icnGears,  
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntSystem				
            },
            {
                xtype       : 'panel',
                title       : 'Mesh Wi-Fi Channel',
                glyph       : Rd.config.icnWifi,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntWifi				
            },
            {
                xtype       : 'panel',
                title       : 'Bridge',
                glyph       : Rd.config.icnExchange,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntBridge				
            },
            {
                xtype       : 'panel',
                title       : 'Monitor',
                glyph       : Rd.config.icnHeartbeat,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntMonitor				
            },
            {
                xtype       : 'panel',
                title       : 'Gateway',
                glyph       : Rd.config.icnArrows,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntGateway				
            },
            {
                xtype       : 'panel',
                title       : 'Dynamic VLANs (Requires RADIUS)',
                glyph       : Rd.config.icnExchange,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntVlans				
            }
        ];    
        me.callParent(arguments);
    }
});
