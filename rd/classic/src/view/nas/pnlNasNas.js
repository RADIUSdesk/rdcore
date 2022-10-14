Ext.define('Rd.view.nas.pnlNasNas', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlNasNa',
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
                 
        var monitor_types = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"off",        "text": i18n("sOff")},
                {"id":"ping",       "text": i18n("sPing")},
                {"id":"heartbeat",  "text": i18n("sHeartbeat")}
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
            valueField      : 'id'
        });
        
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
                    hidden: true
                },
                {
                    itemId      : 'nasname',
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sIP_Address'),
                    name        : "nasname",
                    disabled    : me.nn_disabled, 
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "shortname",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sSecret'),
                    name        : "secret",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                }  
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
                },
                {
                    xtype: 'numberfield',
                    anchor: '100%',
                    name: 'ping_interval',
                    itemId: 'ping_interval',
                    fieldLabel: i18n('sPing_interval'),
                    value: 300,
                    maxValue: 21600,
                    minValue: 300,
                    hidden: true
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
                    boxLabel    : i18n('sRecord_authentication_requests'),
                    name        : 'record_auth',
                    inputValue  : 'record_auth',
                    checked     : false,
                    cls         : 'lblRd',
                    margin: Rd.config.fieldMargin
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sIgnore_accounting_requests'),
                    name        : 'ignore_acct',
                    inputValue  : 'ignore_acct',
                    checked     : false,
                    cls         : 'lblRd',
                    margin: Rd.config.fieldMargin
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAuto_close_stale_sessions'),
                    name        : 'session_auto_close',
                    inputValue  : 'session_auto_close',
                    checked     : false,
                    cls         : 'lblRd',
                    margin: Rd.config.fieldMargin
                },
                {
                    xtype: 'numberfield',
                    anchor: '100%',
                    name: 'session_dead_time',
                    fieldLabel: i18n('sAuto_close_activation_time'),
                    value: 300,
                    maxValue: 21600,
                    minValue: 300,
                    hidden: false
                },
                {
                    xtype       : 'cmbTimezones',
                    required    : false,
                    value       : 24,
                    allowBlank  : true
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
            }
        ];      

        me.callParent(arguments);
    }
});
