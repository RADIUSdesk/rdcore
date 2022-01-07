Ext.define('Rd.view.dynamicClients.pnlDynamicClientDynamicClient', {
    extend              : 'Ext.panel.Panel',
    xtype               : 'pnlDynamicClientDynamicClient',
    border              : false,
    dynamic_client_id   : null,
    layout              : 'hbox',
    bodyStyle           : {backgroundColor : Rd.config.panelGrey },
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',    
        'Rd.view.components.cmbTimezones'
    ],
    initComponent       : function(){
    
        var me = this;
        
        var dataUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"mb",  "name":"MB"},
                {"id":"gb",  "name":"GB"}
            ]
        });
        
        var capUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"hard",  "name":"Hard"},
                {"id":"soft",  "name":"Soft"}
            ]
        });

        var cmbDataUnit = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Unit',
            store           : dataUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'data_limit_unit',
            itemId          : 'cmbDataLimitUnit',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            anchor          : '100%',
            forceSelection  : true,
            hidden          : true
        });
        cmbDataUnit.select(cmbDataUnit.getStore().getAt(0));
        
        var cmbDailyDataUnit = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Unit',
            store           : dataUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'daily_data_limit_unit',
            itemId          : 'cmbDailyDataLimitUnit',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            anchor          : '100%',
            forceSelection  : true,
            hidden          : true
        });
        cmbDailyDataUnit.select(cmbDailyDataUnit.getStore().getAt(0));
        
        var capUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"hard",  "name":"Hard"},
                {"id":"soft",  "name":"Soft"}
            ]
        });
         
        var cmbDataCap = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Cap Type',
            store           : capUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'data_limit_cap',
            itemId          : 'cmbDataLimitCap',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            anchor          : '100%',
            forceSelection  : true,
            hidden          : true
        });
        cmbDataCap.select(cmbDataCap.getStore().getAt(0));
        
        var cmbDailyDataCap = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Cap Type',
            store           : capUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'daily_data_limit_cap',
            itemId          : 'cmbDailyDataLimitCap',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            anchor          : '100%',
            forceSelection  : true,
            hidden          : true
        });
        cmbDailyDataCap.select(cmbDailyDataCap.getStore().getAt(0));
          
        var monitor_types = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"off",        "text": i18n("sOff")},
                {"id":"heartbeat",  "text": i18n("sHeartbeat")},
                {"id":"websocket",  "text": 'Websocket'}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbMt = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : i18n('sMonitor_method'),
            store           : monitor_types ,
            itemId          : 'monitorType',
            name            : 'monitor',
            queryMode       : 'local',
            displayField    : 'text',
            valueField      : 'id',
            value           : 'off'
        });

        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  : 'fit',
                autoScroll:true,
                frame   : true,
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: Rd.config.fieldMargin,
                    labelWidth  : Rd.config.labelWidth
                    //labelWidth: 100
                },
                items       : [
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
                            title   : 'Basic',
                            layout  : 'anchor',
                            itemId  : 'tabBasic',
                            autoScroll: true,
                            defaults: {
                                anchor  : '100%'
                            },
                            items:[
                                 {
                                    xtype       : 'fieldcontainer',
                                    itemId      : 'fcPickOwner',
                                    hidden      : true,  
                                    layout      : {
                                        type    : 'hbox',
                                        align   : 'begin',
                                        pack    : 'start'
                                    },
                                    items:[
                                        {
                                            itemId      : 'owner',
                                            xtype       : 'displayfield',
                                            fieldLabel  : i18n('sOwner'),
                                            name        : 'username',
                                            itemId      : 'displUser',
                                            margin      : 0,
                                            padding     : 0,
                                            width       : 360
                                        },
                                        {
                                            xtype       : 'button',
                                            text        : 'Pick Owner',
                                            margin      : 5,
                                            padding     : 5,
                                            ui          : 'button-green',
                                            itemId      : 'btnPickOwner',
                                            width       : 100
                                        },
                                        {
                                            xtype       : 'textfield',
                                            name        : "user_id",
                                            itemId      : 'hiddenUser',
                                            hidden      : true
                                        }
                                    ]
                                },
                                {
                                    itemId  : 'user_id',
                                    xtype   : 'textfield',
                                    name    : 'dynamic_client_id',
                                    hidden  : true,
                                    value   : me.dynamic_client_id
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : 'NAS-Identifier',
                                    name        : "nasidentifier",
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Called-Station-Id',
                                    name        : "calledstationid",
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                }  
                            ]
                        },
                        { 
                            title   : 'Monitor',
                            itemId  : 'tabMonitor',
                            autoScroll: true,
                            layout    : 'anchor',
                            defaults    : {
                                anchor  : '100%'
                            },
                            items: [
                                cmbMt,
                                {
                                    xtype: 'numberfield',
                                    anchor: '100%',
                                    name: 'heartbeat_dead_after',
                                    itemId: 'heartbeat_dead_after',
                                    fieldLabel: i18n('sHeartbeat_is_dead_after'),
                                    value: 300,
                                    maxValue: 21600,
                                    minValue: 300,
                                    hidden: true
                                }
                            ]
                        },
                        { 
                            title   : 'Maps',
                            itemId  : 'tabMaps',
                            autoScroll: true,
                            layout    : 'anchor',
                            defaults    : {
                                anchor  : '100%'
                            },
                            items   : [
                                    {
                                    xtype       : 'numberfield',
                                    name        : 'lon',  
                                    fieldLabel  : i18n('sLongitude'),
                                    value       : 0,
                                    maxValue    : 180,
                                    minValue    : -180,
                                    decimalPrecision: 14,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'lat',  
                                    fieldLabel  : i18n('sLatitude'),
                                    value       : 0,
                                    maxValue    : 90,
                                    minValue    : -90,
                                    decimalPrecision: 14,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sDispaly_on_public_maps'),
                                    name        : 'on_public_maps',
                                    inputValue  : 'on_public_maps',
                                    checked     : false,
                                    cls         : 'lblRd',
                                    margin: Rd.config.fieldMargin
                                }    
                            ]
                        },
                        { 
                            title   : 'Enhancements',
                            itemId  : 'tabEnhancements',
                            autoScroll: true,
                            layout    : 'anchor',
                            defaults    : {
                                anchor  : '100%'
                            },
                            items: [
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sActive'),
                                    name        : 'active',
                                    inputValue  : 'active',
                                    itemId      : 'active',
                                    checked     : true,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                                    name        : 'available_to_siblings',
                                    inputValue  : 'available_to_siblings',
                                    itemId      : 'a_to_s',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },  
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sAuto_close_stale_sessions'),
                                    name        : 'session_auto_close',
                                    itemId      : 'chkSessionAutoClose',
                                    inputValue  : 'session_auto_close',
                                    checked     : true,
                                    cls         : 'lblRd',
                                    margin: Rd.config.fieldMargin
                                },
                                {
                                    xtype       : 'numberfield',
                                    itemId      : 'nrSessionDeadTime',
                                    anchor      : '100%',
                                    name        : 'session_dead_time',
                                    fieldLabel  : i18n('sAuto_close_activation_time'),
                                    value       : 300,
                                    maxValue    : 21600,
                                    minValue    : 300,
                                    hidden      : false
                                },
                                {
                                    xtype       : 'cmbTimezones',
                                    required    : false,
                                    value       : 24,
                                    allowBlank  : true
                                } 
                            ]
                        },
                        { 
                            title   : 'Data Limit',
                            itemId  : 'tabDataLimit',
                            autoScroll: true,
                            items: [
                                {
                                    xtype       : 'fieldset',
                                    title       : 'Daily Limit',
                                    margin      : '5 10 5 5',
                                    defaultType : 'textfield',
                                    items: [
                                       {
                                            xtype       : 'checkbox',      
                                            boxLabel    : i18n('sActive'),
                                            name        : 'daily_data_limit_active',
                                            inputValue  : 'daily_data_limit_active',
                                            itemId      : 'chkDailyDataLimitActive',
                                            checked     : false,
                                            cls         : 'lblRd'
                                            
                                        },
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDailyDataLimitAmount',
                                            anchor      : '100%',
                                            name        : 'daily_data_limit_amount',
                                            fieldLabel  : 'Amount',
                                            value       : 1,
                                            maxValue    : 1023,
                                            minValue    : 1,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        },
                                        cmbDailyDataUnit,
                                        cmbDailyDataCap,
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDailyDataLimitResetHour',
                                            anchor      : '100%',
                                            name        : 'daily_data_limit_reset_hour',
                                            fieldLabel  : 'Hour To Reset',
                                            value       : 0,
                                            maxValue    : 23,
                                            minValue    : 0,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        },
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDailyDataLimitResetMinute',
                                            anchor      : '100%',
                                            name        : 'daily_data_limit_reset_minute',
                                            fieldLabel  : 'Minute To Reset',
                                            value       : 0,
                                            maxValue    : 59,
                                            minValue    : 0,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        }     
                                    ]
                                },
                                 {
                                    xtype       : 'fieldset',
                                    title       : 'Monthly Limit',
                                    defaultType : 'textfield',
                                    margin      : '5 10 5 5',
                                    items: [                                                        
                                        {
                                            xtype       : 'checkbox',      
                                            boxLabel    : i18n('sActive'),
                                            name        : 'data_limit_active',
                                            inputValue  : 'data_limit_active',
                                            itemId      : 'chkDataLimitActive',
                                            checked     : false,
                                            cls         : 'lblRd'
                                            
                                        },
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDataLimitAmount',
                                            anchor      : '100%',
                                            name        : 'data_limit_amount',
                                            fieldLabel  : 'Amount',
                                            value       : 1,
                                            maxValue    : 1023,
                                            minValue    : 1,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        },
                                        cmbDataUnit,
                                        cmbDataCap,
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDataLimitResetOn',
                                            anchor      : '100%',
                                            name        : 'data_limit_reset_on',
                                            fieldLabel  : 'Day To Reset',
                                            value       : 1,
                                            maxValue    : 31,
                                            minValue    : 1,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        },
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDataLimitResetHour',
                                            anchor      : '100%',
                                            name        : 'data_limit_reset_hour',
                                            fieldLabel  : 'Hour To Reset',
                                            value       : 0,
                                            maxValue    : 23,
                                            minValue    : 0,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        },
                                        {
                                            xtype       : 'numberfield',
                                            itemId      : 'nrDataLimitResetMinute',
                                            anchor      : '100%',
                                            name        : 'data_limit_reset_minute',
                                            fieldLabel  : 'Minute To Reset',
                                            value       : 0,
                                            maxValue    : 59,
                                            minValue    : 0,
                                            hidden      : true,
                                            labelClsExtra   : 'lblRdReq'
                                        }
                                    ]
                                }     
                            ]
                        }
                    ]
                  }             
                ],
                buttons: [
                    {
                        itemId: 'save',
                        formBind: true,
                        text: i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-save',
                        glyph: Rd.config.icnYes,
                        margin: Rd.config.buttonMargin
                    }
                ]
            };

        me.callParent(arguments);
    }
});
