Ext.define('Rd.view.dynamicClients.winAttachUnknownDynamicClient', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winAttachUnknownDynamicClient',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Attach Unknown Client To Owner',
    width       : 500,
    height      : 520,
    plain       : true,
    border      : false,
    layout      : 'fit',
    iconCls     : 'add',
    glyph       : Rd.config.icnAttach,
    autoShow    : false,
    defaults    : {
            border  : false
    },
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },
    mkScrnData: function(){
    
        var me      = this;
        var dataUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"mb",  "name":"MB"},
                {"id":"gb",  "name":"GB"}
            ]
        });

        // Create the combo box, attached to the states data store
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
            forceSelection  : true,
            hidden          : true
        });
        cmbDataUnit.select(cmbDataUnit.getStore().getAt(0));

         
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
            value          : 'off'
        });

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin      : Rd.config.fieldMargin,
                labelWidth  : Rd.config.labelWidth,
                maxWidth    : Rd.config.maxWidth  
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : true,
                    tabPosition: 'bottom',
                    border  : false,
                    cls     : 'subTab',
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
                                    name        : 'unknown_dynamic_client_id',
                                    hidden      : true,
                                    xtype       : 'textfield',
                                    value       : me.unknown_dynamic_client_id
                                },
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'NAS-Identifier',
                                    value       : me.nasidentifier,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Called-Station-Id',
                                    value       : me.calledstationid,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                }
                            ]
                        },
                        { 
                            title   : 'Monitor',
                            itemId  : 'tabMonitor',
                            layout    : 'anchor',
                            autoScroll: true,
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
                            layout    : 'anchor',
                            autoScroll: true,
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
                            'title' : i18n('sRealms'),
                            itemId  : 'tabRealms',
                            layout  : 'fit',
                            items   : { xtype: 'pnlRealmsForDynamicClientCloud'}
                        }
                    ]
                }    
            ],
            buttons: [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
