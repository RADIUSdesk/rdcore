Ext.define('Rd.view.trafficClasses.winTrafficClassAddWizard', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTrafficClassAddWizard',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New Traffic Class Set',
    width       : 500,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border: false
    },
    no_tree     : false, //If the user has no children we don't bother giving them a branchless tree
    user_id     : '',
    owner       : '',
    startScreen : 'scrnApTree', //Default start screen
    requires    : [
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

    //_______ Data for Openvpn Servers  _______
    mkScrnData: function(){


        var me      = this;
        var buttons = [
                {
                    itemId: 'btnDataPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: Rd.config.buttonMargin
                },
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: Rd.config.buttonMargin
                }
            ];

        if(me.no_tree == true){
            var buttons = [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: Rd.config.buttonMargin
                }
            ];
        }

        var frmData = Ext.create('Ext.form.Panel',{
            border      : false,
            layout      : 'fit',
            itemId      : 'scrnData',
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : 100,
                margin          : Rd.config.fieldMargin
            },
            items       : [
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
                            'title'     : 'General',
                            'layout'    : 'anchor',
                            itemId      : 'tabGeneral',
                            autoScroll  : true,
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
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
                                }, 
                                {
                                    itemId      : 'owner',
                                    xtype       : 'displayfield',
                                    fieldLabel  : i18n('sOwner'),
                                    value       : me.owner,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sDescription'),
                                    name        : "description",
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                                    name        : 'available_to_siblings',
                                    inputValue  : 'available_to_siblings',
                                    itemId      : 'a_to_s',
                                    checked     : false,
                                    cls         : 'lblRd'
                                }
                            ]
                        },
                        {
                            title       : 'Content',
                            layout      : 'anchor',
                            itemId      : 'tabContent',
                            defaults    : {
                                    anchor: '100%'
                            },
                            autoScroll  :false,
                            items       :[
                                {
                                    xtype       : 'textareafield',
                                    grow        : true,
                                    growMax     : 300,
                                    fieldLabel  : 'Config Text',
                                    name        : 'content',
                                    allowBlank  : true,
                                    labelWidth  : 100,
                                    labelClsExtra: 'lblRd'
                                 }
                            ]
                        }          
                    ]
                }              
            ],
            buttons     : buttons    
        });
        return frmData;
    }   
});
