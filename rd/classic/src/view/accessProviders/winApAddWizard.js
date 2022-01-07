Ext.define('Rd.view.accessProviders.winApAddWizard', {
    extend:     'Ext.window.Window',
    alias :     'widget.winApAddWizard',
    closable:   true,
    draggable:  true,
    resizable:  false,
    title:      i18n('sNew_Access_Provider'),
    width:      550,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'card',
    glyph:      Rd.config.icnAdd,  
    autoShow:   false,
    defaults: {
            border: false
    },
    no_tree: false, //If the user has no children we don't bother giving them a branchless tree
    user_id: '',
    owner: '',
    startScreen: 'scrnApTree', //Default start screen
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.components.btnDataPrev',
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree    = me.mkScrnApTree();
        var scrnData      = me.mkScrnData();
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
            itemId  : 'scrnApTree',
            border  : false
        });
        return pnlTree;
    },
    //_______ Data for Access Provider  _______
    mkScrnData: function(){
        var me      = this;
        
        var buttons = [
                { xtype : 'btnDataPrev' },
                { xtype : 'btnDataNext' }          
        ];

        if(me.no_tree == true){
            buttons = [ 
                  { xtype : 'btnDataNext' }
            ];
        }

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
            buttons : buttons,
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
                                    itemId  : 'parent_id',
                                    xtype   : 'textfield',
                                    name    : "parent_id",
                                    value   : me.user_id,
                                    hidden  : true
                                },      
                                {
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner
                                },
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
