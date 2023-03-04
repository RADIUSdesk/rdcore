Ext.define('Rd.view.dynamicClients.pnlDynamicClientDynamicClient', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicClientDynamicClient',
    requires    : [
        'Rd.view.dynamicClients.vcDynamicClients'
    ],
    controller  : 'vcDynamicClients',
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
    ap_id       : null,
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
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
        var w_sec   = w_prim - 30;

        var store_proto = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"http", "name":"HTTP"},
                {"id":"https", "name":"HTTPS"}
            ]
        });
         
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
            hidden          : false,
            disabled		: true
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
            hidden          : false,
            disabled		: true
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

        var pnlMikrotik = {
            xtype   : 'panel',
            itemId  : 'pnlMikrotik',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    xtype       : 'combobox',
                    fieldLabel  : 'Protocol',
                    store       : store_proto,
                    queryMode   : 'local',
                    name        : 'mt_proto',
                    displayField: 'name',
                    valueField  : 'id',
                    value       : 'http',
                    width       : w_sec
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : 'mt_host',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq',
                    width       : w_sec,
                    vtype       : 'IPAddress'
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'Port',
                    name            : 'mt_port',
                    width           : w_sec,
                    value           : 8728,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Username',
                    name            : 'mt_user',
                    allowBlank      : false,
                    blankText       : i18n('sSupply_a_value'),
                    width           : w_sec,
                    labelClsExtra   : 'lblRdReq'
                },
                {
                    xtype           : 'rdPasswordfield',
                    rdName          : 'mt_pass',
                    width           : w_sec,
                    rdLabel         : 'Password'
                },
                {
                    xtype           : 'button',
                    text            : 'Test API Connection',
                    ui              : 'button-teal',
                    itemId          : 'btnMikrotikTest',
                    scale           : 'medium',
                    width           : w_prim-25,
                    padding         : 10,
                    margin          : 10,
                    listeners   : {
                        click     : 'onMikrotikTestClick'
                    }    
                },
                {
                    xtype   : 'panel',
                    itemId  : 'pnlMtReply',
                    hidden  : true,
                    tpl     : new Ext.XTemplate(
                        '<div style="padding:10px;">',
                            '<h4>API Connection Is Good</h4>', 
                             '<dl>',
                                '<tpl foreach=".">',
                                    '<dt style="color:#c1c1c1">{$}</dt>', // the special **`{$}`** variable contains the property name
                                    '<dd style="color:#014a8a; font-size:14px;">{.}</dd>', // within the loop, the **`{.}`** variable is set to the property value
                                '</tpl>',
                            '</dl>',
                        '</div>'
                    ),
                    bodyStyle   : 'background: #ebffed',
                    data    : {}
                }         
            ]
        };
        
        var pnlPrivatePsk = {
            xtype   : 'panel',
            itemId  : 'pnlPrivatePsk',
            hidden  : true,
            disabled: true,
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                {
                    xtype       	: 'textfield',
                    fieldLabel  	: 'Default Key',
                    name        	: 'ppsk_default_key',
                    itemId      	: 'default_key',
                    minLength   	: 8,
                    width           : w_sec,
                    allowBlank  	: false,  
                    blankText   	: i18n("sSupply_a_value"),
                    labelClsExtra	: 'lblRdReq'
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'Default VLAN',
                    name            : 'ppsk_default_vlan',
                    width           : w_sec,
                    value       	: 0,
                    maxValue    	: 4094,
                    minValue    	: 0,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false
                },
                {
                    xtype       	: 'checkbox',      
                    fieldLabel  	: 'Log Client MAC',
                    name        	: 'ppsk_record_mac',
                    checked     	: false
                }                  
            ]
        };
                
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype: 'textfield',
                    name : "id",
                    hidden: true,
                    itemId: 'txtId'
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
                },
                {
                    xtype       : 'cmbNasTypes',
                    listeners   : {
		                change : 'onCmbNasTypesChange'
			        } 
                },
                pnlMikrotik,
                pnlPrivatePsk 
            ]
        }
        
        var cntMonitor  = {
        	xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
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
        }
        
        var cntMaps = {
        	xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
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
        }
        
       	var cntEnhancements  = {
        	xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
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
        }
        
      	var cntDataLimit  = {
        	xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
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
                items       : cntRequired				
            },
            {
                xtype       : 'panel',
                title       : 'Monitor',
                glyph       : Rd.config.icnMobile, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntMonitor				
            },
            {
                xtype       : 'panel',
                title       : 'Maps',
                glyph       : Rd.config.icnMap, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntMaps				
            },
            {
                xtype       : 'panel',
                title       : 'Enhancements',
                glyph       : Rd.config.icnStar, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntEnhancements				
            },
            {
                xtype       : 'panel',
                title       : "Data Limit",
                glyph       : Rd.config.icnGavel, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntDataLimit				
            }
        ];      

        me.callParent(arguments);
    }
});
