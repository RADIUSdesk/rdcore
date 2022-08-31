Ext.define('Rd.view.settings.pnlSettingsDefaults', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlSettingsDefaults',
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
        'Rd.view.settings.vcSettingsDefaults'
    ],
    controller  : 'vcSettingsDefaults',
    listeners       : {
        activate  : 'onViewActivate'
    },
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;

        var store_proto = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"http", "name":"HTTP"},
                {"id":"https", "name":"HTTPS"}
            ]
        });
           
        var cntMdAndAp  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            defaultType : 'textfield',
            items       : [
                {
                    xtype   : 'rdPasswordfield'
                },                             
                {
                    xtype   : 'cmbCountries',
                    labelClsExtra   : 'lblRdReq'
                },
                {
                    xtype   : 'cmbTimezones',
                    labelClsExtra   : 'lblRdReq'
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
        
        var cntCp  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            defaultType : 'textfield',
            items       : [
                {
                    fieldLabel      : 'RADIUS-1',
                    name            : 'cp_radius_1',
                    allowBlank      : false,
                    blankText       : i18n('sSupply_a_value'),
                    labelClsExtra   : 'lblRdReq'
                },
                {
                    fieldLabel      : 'RADIUS-2',
                    name            : 'cp_radius_2',
                    allowBlank      : true,
                    blankText       : i18n('sSupply_a_value'),
                    labelClsExtra   : 'lblRd'
                },
                {
                    xtype           : 'rdPasswordfield',
                    rdName          : 'cp_radius_secret',
                    rdLabel         : 'Shared Secret'
                }, 
                {
                    fieldLabel      : 'UAM URL',
                    name            : 'cp_uam_url',
                    allowBlank      : false,
                    blankText       : i18n('sSupply_a_value'),
                    labelClsExtra   : 'lblRdReq'
                },
                {
                    xtype           : 'rdPasswordfield',
                    rdName          : 'cp_uam_secret',
                    rdLabel         : 'UAM Secret'
                }, 
                { 
                    fieldLabel      : 'Swap Octets', 
                    name            : 'cp_swap_octet',
                    labelClsExtra   : 'lblRdReq',
                    checked         : true, 
                    xtype           : 'checkbox' 
                },
                { 
                    fieldLabel      : 'MAC Auth', 
                    name            : 'cp_mac_auth',
                    labelClsExtra   : 'lblRdReq',
                    checked         : true, 
                    xtype           : 'checkbox' 
                },
                {
                    xtype           : 'textareafield',
                    grow            : true,
                    name            : 'cp_coova_optional',
                    fieldLabel      : 'Optional Coova',
                    anchor          : '100%',
                    labelClsExtra   : 'lblRd'
                }                      
            ]
        }
              
        me.items = [
            {
                xtype       : 'panel',
                title       : "MESHdesk and APdesk Hardware",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntMdAndAp				
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
                title       : 'Captive Portal',
                glyph       : Rd.config.icnGlobe, 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntCp				
            }
        ];    
        me.callParent(arguments);
    }
});
