Ext.define('Rd.view.nas.winNasAddWizard', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winNasAddWizard',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : i18n('sAdd_NAS_device'),
    width       : 500,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'card',
    iconCls     : 'add',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    startScreen : 'scrnApTree', //Default start screen
    urlConnTypes: '/cake3/rd_cake/nas/conn_types_available.json',
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.store.sDynamicAttributes' 
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnConType     = me.mkScrnConType();
        var scrnOpenvpn     = me.mkScrnOpenvpn();
        var scrnDynamic     = me.mkScrnDynamic();
        var scrnDirect      = me.mkScrnDirect();
        var scrnPptp        = me.mkScrnPptp();
      //  var scrnRealmsForNasOwner = me.scrnRealmsForNasOwner();

        this.items = [
            scrnApTree,
            scrnConType,
            scrnOpenvpn,
            scrnDynamic,
            scrnDirect,
            scrnPptp
        ]; 
        this.callParent(arguments);

        //Get the connection types:
        Ext.Ajax.request({
            url: me.urlConnTypes,
            method: 'GET',
            success: me.addConnTypes,
            scope: me
        });
        me.getLayout().setActiveItem(me.startScreen);
    },

    addConnTypes: function(response){

        var me          = this;
        var jsonData    = Ext.JSON.decode(response.responseText);
        var rbgrp       = me.down('radiogroup');

        if(jsonData.success){
            Ext.Array.each(jsonData.items, function(i,j){
                if(j == 0){
                    rbgrp.add({ boxLabel: i.name, name: 'rb', inputValue: i.id, checked: true});
                }else{
                    rbgrp.add({ boxLabel: i.name, name: 'rb', inputValue: i.id});
                } 
            });
        }
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId: 'scrnApTree'
        });
        return pnlTree;
    },
    

    //_______ Connetion Type selection _______
    mkScrnConType: function(){

        var me = this;

        var buttons = [
                {
                    itemId: 'btnConTypePrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnConTypeNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];

        if(me.no_tree){
            buttons = [
                {
                    itemId: 'btnConTypeNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }

        var frmConType = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnConType',
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'top',
                labelSeparator: '',
                margin: '15 10 15 10'
            },
            defaultType: 'textfield',
            tbar: [
                { xtype: 'tbtext', text: i18n('sChoose_a_connection_type'), cls: 'lblWizard' }
            ],
            items:[{
                xtype: 'radiogroup',
                fieldLabel: i18n('sConnection_type'),
                columns: 1,
                vertical: true
            }],
            buttons: buttons
        });
        return frmConType;
    },

    //______ OpenVPN username and optional password) _____
    mkScrnOpenvpn: function(){

        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnOpenvpn',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth: 150,
                margin: 10
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'btnOpenvpnPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnOpenvpnNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ],
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
                            'title'     : i18n('sOpenVPN'),
                            'layout'    : 'anchor',
                            itemId      : 'tabVpn',
                            defaults    : {
                                anchor: '100%'
                            },
                            tbar: [
                                { xtype: 'tbtext', text: i18n('sOpenVPN_credentials'), cls: 'lblWizard' }
                            ],
                            items:[
                                {
                                    itemId      : 'username',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sUsername'),
                                    name        : 'username',
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'password',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPassword'),
                                    name        : 'password',
                                    labelClsExtra: 'lblRd'
                                } 
                            ]
                        },
                        { 
                            'title'     : i18n('sNAS'),
                            'layout'    : 'anchor',
                            itemId      : 'tabNas',
                            defaults    : {
                                anchor: '100%'
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
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'nasname',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : "nasname",
                                    allowBlank  : false,
                                    value       : i18n("sSet_by_server"),
                                    disabled    : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "shortname",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSecret'),
                                    name        : "secret",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
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
                            items: { xtype: 'gridRealmsForNasOwner', realFlag: true}
                        }
                    ]
                }    
            ]
        });
        return frmData;
    },

    //______ Pptp username and password _____
    mkScrnPptp: function(){

        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnPptp',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth: 150,
                margin: 10
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'btnPptpPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnPptpNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ],
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
                            'title'     : i18n('sPPTP'),
                            'layout'    : 'anchor',
                            itemId      : 'tabVpn',
                            defaults    : {
                                anchor: '100%'
                            },
                            tbar: [
                                { xtype: 'tbtext', text: i18n('sPPTP_credentials'), cls: 'lblWizard' }
                            ],
                            items:[
                                {
                                    itemId      : 'username',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sUsername'),
                                    name        : 'username',
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'password',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPassword'),
                                    name        : 'password',
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                } 
                            ]
                        },
                        { 
                            'title'     : i18n('sNAS'),
                            'layout'    : 'anchor',
                            itemId      : 'tabNas',
                            defaults    : {
                                anchor: '100%'
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
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'nasname',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : "nasname",
                                    allowBlank  : false,
                                    value       : i18n("sSet_by_server"),
                                    disabled    : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "shortname",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSecret'),
                                    name        : "secret",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
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
                            items: { xtype: 'gridRealmsForNasOwner', realFlag: true}
                        }
                    ]
                }    
            ]
        });
        return frmData;
    },

    //______ Dynamic Clients Attribute selection and value _____
    mkScrnDynamic: function(){

         var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnDynamic',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth: 150,
                margin: 10
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
                            'title'     : i18n('sDynamic_AVP_detail'),
                            'layout'    : 'anchor',
                            itemId      : 'tabDynamic',
                            defaults    : {
                                anchor: '100%'
                            },
                            tbar: [
                                { xtype: 'tbtext', text: i18n('sUnique_AVP_combination'), cls: 'lblWizard' }
                            ],
                            items:[
                                {
                                    xtype: 'combo',
                                    fieldLabel: i18n('sAttribute'),
                                    labelSeparator: '',
                                    store: 'sDynamicAttributes',
                                    queryMode: 'local',
                                    valueField: 'id',
                                    displayField: 'name',
                                    allowBlank: false,
                                    editable: false,
                                    mode: 'local',
                                    itemId: 'dynamic_attribute',
                                    name: 'dynamic_attribute'
                                },
                                {
                                    itemId      : 'dynamic_value',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sValue'),
                                    name        : 'dynamic_value',
                                    allowBlank  : false,
                                    blankText   : i18n('sValue_to_identify_the_NAS_with'),
                                    labelClsExtra: 'lblRdReq'
                                } 
                            ]
                        },
                        { 
                            'title'     : i18n('sNAS'),
                            'layout'    : 'anchor',
                            itemId      : 'tabNas',
                            defaults    : {
                                anchor: '100%'
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
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'nasname',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : "nasname",
                                    allowBlank  : false,
                                    value       : i18n("sSet_by_server"),
                                    disabled    : true,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "shortname",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSecret'),
                                    name        : "secret",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
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
                            items: { xtype: 'gridRealmsForNasOwner', realFlag: true}
                        }
                    ]
                }    
            ],
            buttons: [
                {
                    itemId: 'btnDynamicPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDynamicNext',
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
    },

    //_______ Direct connection  _______
    mkScrnDirect: function(){

        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnDirect',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth: 150,
                margin: 10
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
                            'title' : i18n('sNAS'),
                            'layout'    : 'anchor',
                            itemId  : 'tabNas',
                            defaults    : {
                                anchor: '100%'
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
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'nasname',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : "nasname",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    vtype       : 'IPAddress'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "shortname",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSecret'),
                                    name        : "secret",
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
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
                            items: { xtype: 'gridRealmsForNasOwner', realFlag: true}
                        }
                    ]
                }    
            ],
            buttons: [
                {
                    itemId: 'btnDirectPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDirectNext',
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
