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
    layout      : 'card',
    iconCls     : 'add',
    glyph       : Rd.config.icnAttach,
    autoShow    : false,
    defaults    : {
            border  : false
    },
    no_tree     : false, //If the user has no children we don't bother giving them a branchless tree
    user_id     : '',
    owner       : '',
    startScreen : 'scrnApTree', //Default start screen
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnApTree,
            scrnData
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId: 'scrnApTree'
        });
        return pnlTree;
    },

    //_______ Data for ssids  _______
    mkScrnData: function(){
    
        var me      = this;
        var buttons = [
                {
                    itemId: 'btnDataPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
            
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

        if(me.no_tree == true){
            var buttons = [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }
         
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
                                    itemId  : 'user_id',
                                    xtype   : 'textfield',
                                    name    : "user_id",
                                    hidden  : true,
                                    value   : me.user_id
                                },
                                {
                                    xtype   : 'textfield',
                                    name    : 'unknown_dynamic_client_id',
                                    hidden  : true,
                                    value   : me.unknown_dynamic_client_id
                                },
                                {
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
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
                            layout    : 'anchor',
                            defaults    : {
                                anchor  : '100%'
                            },
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
                        },
                        { 
                            'title' : i18n('sRealms'),
                            itemId  : 'tabRealms',
                            tbar: [{
                                xtype       : 'checkboxfield',
                                boxLabel    : i18n('sMake_available_to_any_realm'), 
                                cls         : 'lblRd',
                                itemId      : 'chkAvailForAll',
                                name        : 'available_to_all',
                                inputValue  : true
                            }],
                            layout: 'fit',
                            items: { xtype: 'gridRealmsForDynamicClientOwner', realFlag: true}
                        }
                    ]
                }    
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
