Ext.define('Rd.view.nas.pnlNasNas', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlNasNas',
    border  : false,
    nas_id  : null,
    url     : null,
    layout: 'hbox',
    nn_disabled: true,
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    initComponent: function(){
        var me = this;

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

        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  : 'fit',
                autoScroll:true,
                frame   : false,
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: Rd.config.fieldMargin,
                    labelWidth: Rd.config.labelWidth,
                    maxWidth: Rd.config.maxWidth  
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
                                'title'     : i18n('sRequired_info'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                items: [
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
                            },
                            { 
                                'title'     : i18n('sOptional_info'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                items: [
                                   {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sNAS-Identifier'),
                                        name        : "nasidentifier",
                                        labelClsExtra: 'lblRd'
                                    },
                                   { 
                                        xtype        : 'cmbNasTypes'
                                    },

                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sPorts'),
                                        name        : "ports",
                                        labelClsExtra: 'lblRd'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sCommunity'),
                                        name        : "community",
                                        labelClsExtra: 'lblRd'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sServer'),
                                        name        : "server",
                                        labelClsExtra: 'lblRd'
                                    },
                                    {
                                        xtype       : 'textareafield',
                                        grow        : true,
                                        name        : 'description',
                                        fieldLabel  : i18n('sDescription'),
                                        anchor      : '100%',
                                        labelClsExtra: 'lblRd'
                                    }
                                ]
                            },
                            { 
                                'title'     : i18n('sMonitor_settings'),
                                'layout'    : 'anchor',
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
                            },
                            { 
                                'title'     : i18n('sMaps_info'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                items: [
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
                                'title'     : i18n('sEnhancements'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                items: [
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
