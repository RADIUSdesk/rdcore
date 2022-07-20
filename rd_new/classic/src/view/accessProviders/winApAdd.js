Ext.define('Rd.view.accessProviders.winApAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winApAdd',
    closable:   true,
    draggable:  true,
    resizable:  false,
    title:      i18n('sNew_Access_Provider'),
    width:      500,
    height:     400,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph:      Rd.config.icnAdd,  
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me 			= this;
        var scrnData  	= me.mkScrnData();
        me.items = [
              scrnData
        ];  
        this.callParent(arguments);
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
                            autoScroll  : true,
                            defaults    : {
                                anchor: '100%'
                            },
                           items       : [
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sUsername'),
                                    name        : "username",
                                    allowBlank  :false,
                                    blankText   : i18n("sEnter_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPassword'),
                                    name        : "password",
                                    allowBlank  :false,
                                    blankText   : i18n("sEnter_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                }, 
                                { 
                                    xtype       : 'cmbLanguages', 
                                    width       : 350, 
                                    fieldLabel  : i18n('sLanguage'),  
                                    name        : 'language', 
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq' 
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sActivate'),
                                    name        : 'active',
                                    inputValue  : 'active',
                                    checked     : true,
                                    cls         : 'lblRd'
                                }
                            ]
                        },
                        { 
                            'title'     : i18n('sOptional_info'),
                            'layout'    : 'anchor',
                            itemId      : 'tabOptional',
                            autoScroll  : true,
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name"
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSurname'),
                                    name        : "surname"
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sPhone'),
                                    name        : "phone",
                                    vtype       : 'Numeric'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('s_email'),
                                    name        : "email",
                                    vtype       : 'email'
                                },
                                {
                                    xtype     : 'textareafield',
                                    grow      : true,
                                    name      : 'address',
                                    fieldLabel: i18n('sAddress'),
                                    anchor    : '100%'
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
