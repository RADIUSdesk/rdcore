Ext.define('Rd.view.nas.pnlNasNas', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlNasNas',
    requires    : [
        'Rd.view.nas.vcNas'
    ],
    controller  : 'vcNas',
    realm_id    : null,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    root        : false,
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
        var w_sec   = w_prim - 30;

        var store_proto = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"http", "name":"HTTP"},
                {"id":"https", "name":"HTTPS"}
            ]
        });

        var hide_system = true;
        if(me.root){
            hide_system = false;
        }
                 
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
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    name        : "id",
                    hidden      : true,
                    itemId      : 'txtId'
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
                },
                {
                    xtype       : 'cmbNasTypes',
                    listeners   : {
		                change : 'onCmbNasTypesChange'
			        } 
                },
                pnlMikrotik,  
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    hidden      : hide_system,
                    disabled    : hide_system
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
