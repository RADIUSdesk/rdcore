Ext.define('Rd.view.dynamicDetails.winDynamicDetailAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winDynamicDetailAdd',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sAdd_dynamic_page'),
    width:      500,
    height:     400,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'add',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ]; 
        me.callParent(arguments);
    },
    mkScrnData: function(){
        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget   : 'under',
                labelClsExtra: 'lblRd',
                labelAlign  : 'left',
                labelSeparator: '',
                labelClsExtra: 'lblRd',
                labelWidth  : Rd.config.labelWidth,
                margin      : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons :  [
                { xtype : 'btnDataNext' }
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
                            'title'     : i18n('sRequired_info'),
                            'layout'    : 'anchor',
                            itemId      : 'tabRequired',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Cloud',
                                    value       : me.cloudName,
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
                            'title'     : i18n('sContact_detail'),
                            'layout'    : 'anchor',
                            itemId      : 'tabContact',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [         
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPhone'),
                                    name        : "phone",
                                    allowBlank  : true,
                                    vtype       : 'Numeric'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sFax'),
                                    name        : "fax",
                                    allowBlank  : true,
                                    vtype       : 'Numeric'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sCell'),
                                    name        : "cell",
                                    allowBlank  : true,
                                    vtype       : 'Numeric'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('s_email'),
                                    name        : "email",
                                    allowBlank  : true,
                                    vtype       : 'email'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sURL'),
                                    name        : "url",
                                    allowBlank  : true,
                                    vtype       : 'url'
                                }
                            ]
                        },
                        { 
                            'title'     : i18n('sAddress'),
                            'layout'    : 'anchor',
                            itemId      : 'tabAddress',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [         
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sStreet_Number'),
                                    name        : "street_no",
                                    allowBlank  : true
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sStreet'),
                                    name        : "street",
                                    allowBlank  : true,
                                    margin: 15
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sTown_fs_Suburb'),
                                    name        : "town_suburb",
                                    allowBlank  : true,
                                    margin: 15
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sCity'),
                                    name        : "city",
                                    allowBlank  : true
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sCountry'),
                                    name        : "country",
                                    allowBlank  : true
                                },
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
                                }
                            ]
                        },
                        { 
                            'title'     : "T&C",
                            'layout'    : 'anchor',
                            itemId      : 'tabTc',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [         
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : "Compulsory",
                                    itemId      : 'chkTc',
                                    name        : 't_c_check',
                                    inputValue  : 't_c_check',
                                    checked     : false,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : "URL",
                                    itemId      : 'txtTcUrl',
                                    name        : "t_c_url",
                                    disabled    : true,
                                    allowBlank  : false,
                                    margin      : 15
                                }   
                            ]
                        }
                    ]
                }
            ]
        });
        return frmData;
    }
});
