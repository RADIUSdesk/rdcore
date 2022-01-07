Ext.define('Rd.view.meshes.pnlNodeCommonSettings', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlNodeCommonSettings',
    border  : false,
    layout  : 'hbox',
    align   : 'stretch',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
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
        var me = this;
        
        var store_proto = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"http", "name":"HTTP"},
                {"id":"https", "name":"HTTPS"}
            ]
        });
          
        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  :  'fit',
                autoScroll:true,
                frame   : true,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    labelWidth      : Rd.config.labelWidth+20,
                    margin          : Rd.config.fieldMargin
                },
                items       : [{
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   :  [
                        {
                            title       : 'System',
                            layout      : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       :[
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

                        },
                        {
                            title       : 'WiFi',
                            layout      : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       :[
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
                        },
                        {
                            title       : 'Bridge',
                            layout      : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       :[
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
                        },
                        {
                            title       : 'Monitor',
                            layout      : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       :[
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
                        },
                        {
                            title       : 'Gateway',
                            layout      : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            fieldDefaults: {
                                labelWidth      : 300
                            },
                            autoScroll:true,
                            items       :[
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
                    ]
                }],
                buttons: [
                    {
                        itemId: 'save',
                        formBind: true,
                        text: i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-save',
                        glyph   : Rd.config.icnYes,
                        margin: Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
