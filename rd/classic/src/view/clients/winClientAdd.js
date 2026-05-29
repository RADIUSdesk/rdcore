Ext.define('Rd.view.clients.winClientAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winClientAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Client',
    width       : 500,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
        'Rd.view.components.btnCommon',
        'Rd.view.components.rdPasswordfield'
    ],
    initComponent: function() {
        var me      = this;              
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin,
                labelWidth		: 150
            },
            defaultType: 'textfield',
            buttons: [{xtype: 'btnCommon'}],
            items: [
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
                                    name        : 'username',
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Username (email)',
                                    vtype       : 'email', // Applies built-in email validation
                                    allowBlank  : false,
                                    blankText   : 'Specify an email address',
                                    labelClsExtra   : 'lblRdReq'
                                },
                                {
                                    xtype       : 'rdPasswordfield'
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
        me.items = frmData; 
        me.callParent(arguments);
    }
});
