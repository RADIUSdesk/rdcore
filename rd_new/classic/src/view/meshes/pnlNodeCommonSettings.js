Ext.define('Rd.view.meshes.pnlNodeCommonSettings', {
    extend  : 'Ext.form.Panel',
    alias   : 'widget.pnlNodeCommonSettings',
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
                    anchor      : '100%',
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'cmbTimezones',
                    anchor      : '100%',
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Apply Schedule',
                    name        : 'enable_schedules',
                    inputValue  : '1',
		            itemId		: 'chkEnableSchedules',
                    checked     : false,
                    labelClsExtra: 'lblRdReq'
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
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'cmbFiveGigChannels',
                    anchor      : '100%',
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Client Key',
                    name        : 'client_key',
                    allowBlank  : false,
                    blankText   : i18n.sSupply_a_value,
                    labelClsExtra: 'lblRdReq',
                    minLength   : 8,
                    hidden      : true //Hide for CSC
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
                    fieldLabel  : 'Bridge Repeater WAN',
                    name        : 'eth_br_chk',
                    inputValue  : 'eth_br_chk',
		            itemId		: 'eth_br_chk',
                    checked     : false,
                    labelClsExtra: 'lblRd'
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
                    value       : 'http'//Default
                },
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_light',
                    itemId      : 'report_adv_light',
                    fieldLabel  : 'Light Report Interval',
                    value       : 60,
                    maxValue    : 21600,
                    minValue    : 60
                },
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_full',
                    itemId      : 'report_adv_full',
                    fieldLabel  : 'Full Report Interval',
                    value       : 600,
                    maxValue    : 21600,
                    minValue    : 300
                },
                {
                    xtype       : 'numberfield',
                    name        : 'report_adv_sampling',
                    itemId      : 'report_adv_sampling',
                    fieldLabel  : 'Data Sampling Interval',
                    value       : 60,
                    maxValue    : 21600,
                    minValue    : 60
                },
                {
                    xtype       : 'numberfield',
                    name        : 'heartbeat_dead_after',
                    itemId      : 'heartbeat_dead_after',
                    fieldLabel  : 'Heartbeat Is Dead After',
                    value       : 600,
                    maxValue    : 21600,
                    minValue    : 300
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
                    fieldLabel  : 'Wait time for DHCP IP',
                    value       : 60,
                    maxValue    : 600,
                    minValue    : 30,
                    labelWidth  : 280
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Use previous settings when DHCP fails',
                    name        : 'gw_use_previous',
                    inputValue  : 'gw_use_previous',
		            itemId		: 'gw_use_previous',
                    checked     : true,
                    labelClsExtra: 'lblRd',
                    labelWidth  : 280
                },  
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Reboot node if gateway is unreachable',
                    name        : 'gw_auto_reboot',
                    inputValue  : 'gw_auto_reboot',
		            itemId		: 'gw_auto_reboot',
                    checked     : true,
                    labelClsExtra: 'lblRd',
                    labelWidth  : 280
                },     
                {
                    xtype       : 'numberfield',
                    name        : 'gw_auto_reboot_time',
                    itemId      : 'gw_auto_reboot_time',
                    fieldLabel  : 'Reboot trigger time',
                    value       : 600,
                    maxValue    : 3600,
                    minValue    : 240,
                    labelWidth  : 280
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
                title       : 'Wi-Fi',
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
            }
        ];    
        me.callParent(arguments);
    }
});
