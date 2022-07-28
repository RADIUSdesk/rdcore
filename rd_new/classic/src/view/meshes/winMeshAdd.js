Ext.define('Rd.view.meshes.winMeshAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMeshAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      i18n('sNew_mesh'),
    width:      450,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'fit',
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
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();     
        me.items = [
            scrnData
        ];        
        this.callParent(arguments);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId  : 'scrnApTree',
            border  : false
        });
        return pnlTree;
    },
     
    //_______ Data for mesh  _______
    mkScrnData: function(){

        var me  = this;
   
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
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
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
            buttons: [
                { xtype : 'btnDataNext' }
            ]
        });
        return frmData;
    }   
});
