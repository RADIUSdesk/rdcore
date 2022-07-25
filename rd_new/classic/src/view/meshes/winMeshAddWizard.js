Ext.define('Rd.view.meshes.winMeshAddWizard', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMeshAddWizard',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      i18n('sNew_mesh'),
    width:      450,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph   : Rd.config.icnAdd,
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
        'Rd.view.components.btnDataNext',
        'Rd.view.components.pnlClouds'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnData        = me.mkScrnData();
        
        if(me.enable_grouping){
            var scrnClouds    = me.mkScrnClouds();
            me.items = [
                scrnApTree,
                scrnClouds,
                scrnData
            ];
        }else{  
             me.items = [
                scrnApTree,
                scrnData
            ];
        }
        
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
    
    //__Tree Tags
    mkScrnClouds: function(){
    
        var me          = this;
        var startScreen = true;
        if(me.startScreen == 'scrnApTree'){
            startScreen = false;    
        }
    
        var pnlTree = Ext.create('Rd.view.components.pnlClouds',{
            itemId      : 'scrnClouds',
            wizard      : true,
            border      : false,
            startScreen : startScreen
        });
        return pnlTree;
    }, 
    
    //_______ Data for mesh  _______
    mkScrnData: function(){


        var me      = this;
        var buttons = [
            { xtype : 'btnDataPrev' },
            { xtype : 'btnDataNext' }       
        ];

        if(me.no_tree == true){
            var buttons = [
                { xtype : 'btnDataNext' }
            ];
        }
        grouping_hide = true;
        if(me.enable_grouping){
            grouping_hide = false;
        }

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
                    itemId  : 'user_id',
                    xtype   : 'textfield',
                    name    : "user_id",
                    hidden  : true,
                    value   : me.user_id
                },
                {
                    itemId  : 'network_id',
                    xtype   : 'textfield',
                    name    : "network_id",
                    hidden  : true
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
                    itemId      : 'network_string',
                    xtype       : 'displayfield',
                    fieldLabel  : 'Grouping',
                    labelClsExtra: 'lblRdReq',
                    hidden      : grouping_hide
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
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'a_to_s',
                    checked     : false
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Create Multiple Items',
                    name        : 'multiple',
                    inputValue  : 'multiple',
                    itemId      : 'chkMultiple',
                    checked     : false
                }
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
