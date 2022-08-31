Ext.define('Rd.view.realms.winRealmAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winRealmAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title:      i18n('sAdd_realm'),
    width:      500,
    height:     500,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph:      Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
        'Rd.view.components.btnDataNext'
    ],
     initComponent: function() {
        var me = this;
        var scrnData         = me.mkScrnData();
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
                maxWidth    : Rd.config.maxWidth, 
                margin      : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [{ xtype : 'btnDataNext' }],
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
                        }
                    ]
                }
            ]
        });
        return frmData;
    }
});
