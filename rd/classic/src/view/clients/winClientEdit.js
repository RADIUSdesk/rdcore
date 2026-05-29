Ext.define('Rd.view.clients.winClientEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winClientEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Client',
    width       : 500,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
    ],
    initComponent: function() {
        var me      = this;	           
        var frmData = Ext.create('Ext.form.Panel',{
            border      : false,
            layout      : 'fit',
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
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
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
                                    name        : 'id',
                                    xtype       : 'textfield',
                                    hidden      : true
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
        frmData.loadRecord(me.sr);
    }
});
