Ext.define('Rd.view.aps.pnlAccessPointCommonSettings', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlAccessPointCommonSettings',
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
                frame   : true,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    labelClsExtra   : 'lblRd',
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
                            title       : i18n("sMonitor"),
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
                            title       : i18n("sGateway"),
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
                                    fieldLabel  : i18n("sWait_time_for_DHCP_IP"),
                                    value       : 120,
                                    maxValue    : 600,
                                    minValue    : 120,
                                    labelWidth  : 280
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n("sUse_previous_settings_when_DHCP_fails"),
                                    name        : 'gw_use_previous',
                                    inputValue  : 'gw_use_previous',
						            itemId		: 'gw_use_previous',
                                    checked     : true,
                                    labelClsExtra: 'lblRd',
                                    labelWidth  : 280
                                }       
                            ]
                        }
                    ]
                }],
                buttons: [
                    {
                        itemId  : 'save',
                        formBind: true,
                        text    : i18n("sSave"),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        margin  : Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
