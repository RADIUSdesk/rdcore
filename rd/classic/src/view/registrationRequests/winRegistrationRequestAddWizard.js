Ext.define('Rd.view.registrationRequests.winRegistrationRequestAddWizard', {
    extend:     'Ext.window.Window',
    alias :     'widget.winRegistrationRequestAddWizard',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Registration Request',
    width:      400,
    height:     300,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph: Rd.config.icnAdd,
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
        'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
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

    //_______ Data for RegistrationRequests  _______
    mkScrnData: function(){
    
        var me   = this;
        
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
        
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
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
                margin: 15
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Email',
                    name        : "email",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                }
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
