Ext.define('Rd.view.aps.winAccessPointEditEntry', {
    extend:     'Ext.window.Window',
    alias :     'widget.winAccessPointEditEntry',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'Edit Access Point SSID',
    width:      500,
    height:     470,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'edit',
    glyph:      Rd.config.icnEdit,
    autoShow:   false,
    ap_profile_id:    '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.cmbEncryptionOptions'
    ],
     initComponent: function() {
     
        var me      = this;
        var w_rd    = 80; 
         
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
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'save',
                    text: i18n("sOK"),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    formBind: true,
                    glyph   : Rd.config.icnYes,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items:[
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
                            'title'     : i18n("sBasic_info"),
                            'layout'    : 'anchor',
                            itemId      : 'tabRequired',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    itemId  : 'id',
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
                                }, 
                                {
                                    itemId  : 'ap_profile_id',
                                    xtype   : 'textfield',
                                    name    : "ap_profile_id",
                                    hidden  : true
                                }, 
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n("sSSID"),
                                    name        : 'name',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                 {
                                    xtype       : 'radiogroup',
                                    labelClsExtra: 'lblRdReq',
                                    fieldLabel  : 'Frequency',
                                    columns     : 3,
                                    vertical    : false,
                                    items       : [
                                        {
                                            boxLabel  : '2.4G',
                                            width     : w_rd,
                                            name      : 'frequency_band',
                                            inputValue: 'two',
                                            margin    : '0 15 0 0'
                                        }, 
                                        {
                                            boxLabel  : '5G',
                                            width     : w_rd,
                                            name      : 'frequency_band',
                                            inputValue: 'five',
                                            margin    : '0 0 0 15'
                                        },
                                        {
                                            boxLabel  : '2.4 & 5G',
                                            width     : w_rd,
                                            name      : 'frequency_band',
                                            inputValue: 'both',
                                            value     : true,
                                            margin    : '0 0 0 15'
                                        },
                                        {
                                            boxLabel  : '5G Lower',
                                            width     : w_rd,
                                            name      : 'frequency_band',
                                            inputValue: 'five_lower',
                                            margin    : '0 15 0 0'
                                        }, 
                                        {
                                            boxLabel  : '5G Upper',
                                            width     : w_rd,
                                            name      : 'frequency_band',
                                            inputValue: 'five_upper',
                                            margin    : '0 0 0 15'
                                        }
                                    ]  
                                },              
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n("sHidden"),
                                    name        : 'hidden',
                                    inputValue  : 'hidden',
                                    checked     : false,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n("sClient_isolation"),
                                    name        : 'isolate',
                                    inputValue  : 'isolate',
                                    checked     : false,
                                    labelClsExtra: 'lblRdReq'
                                }
                            ]
                        },
                        { 
                            'title'     : i18n("sEncryption"),
                            'layout'    : 'anchor',
                            itemId      : 'tabEncryption',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [          
                                { 
                                    xtype           : 'cmbEncryptionOptions', 
                                    labelClsExtra   : 'lblRdReq',
                                    allowBlank      : false 
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n("sKey"),
                                    name        : 'special_key',
                                    itemId      : 'key',
                                    minLength   : 8,
                                    allowBlank  : false,  
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    disabled    : true
                                }, 
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n("sRADIUS_server"),
                                    name        : 'auth_server',
                                    itemId      : 'auth_server',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n("sShared_secret"),
                                    name        : 'auth_secret',
                                    itemId      : 'auth_secret',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    disabled    : true
                                },
                                 {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Generate NAS ID',
                                    name        : 'auto_nasid',
                                    inputValue  : 'auto_nasid',
                                    checked     : true,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'chk_auto_nasid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : 'NAS ID',
                                    name        : 'nasid',
                                    itemId      : 'nasid',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Accounting',
                                    name        : 'accounting',
                                    inputValue  : 'accounting',
                                    checked     : true,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'chk_accounting',
                                    hidden      : true,
                                    disabled    : true
                                } 
                            ]
                        },
                        { 
                            'title'     : i18n("sAdvanced"),
                            'layout'    : 'anchor',
                            itemId      : 'tabAdvanced',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [ 
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n("sLimitClients"),
                                    name        : 'chk_maxassoc',
                                    inputValue  : 'chk_maxassoc',
                                    checked     : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'chk_maxassoc'
                                },          
                                {
                                    xtype       : 'numberfield',
                                    name        : 'maxassoc',
                                    fieldLabel  : i18n("sMaxClients"),
                                    value       : 100,
                                    maxValue    : 1000,
                                    minValue    : 1,
                                    labelClsExtra: 'lblRdReq',
                                    hidden      : true,
                                    disabled    : true,
                                    itemId      : 'maxassoc'
                                }, 
                                { 
                                    xtype       : 'cmbMacFilter',
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'cmbPermanentUser',
                                    fieldLabel  : i18n("sBYOD_Belonging_To"),
                                    labelClsExtra: 'lblRdReq',
                                    name        : 'permanent_user_id',
                                    hidden      : true,
                                    disabled    : true
                                }     
                            ]
                        }
                    ]
                }
            ]
        });

        me.items = frmData;
        me.callParent(arguments);
    }
});
