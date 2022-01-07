Ext.define('Rd.view.components.winSelectOwner', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winSelectOwner',
    title   : 'Select Owner',
    layout  : 'fit',
    autoShow: false,
    width   : 600,
    height  : 400,
    glyph   : Rd.config.icnUser,
    updateDisplay: false,
    updateValue  : false,
    requires    : [   
        'Rd.store.sAccessProvidersTree',
        'Rd.view.components.vcSelectOwner' 
    ],
    controller  : 'vcSelectOwner',
    initComponent: function() {
        var me     = this;
        var store  = Ext.create('Rd.store.sAccessProvidersTree', {});
        me.items  = [ {
            xtype       :'treepanel',
            useArrows   : true,
            rootVisible : true,
            rowLines    : true,
            layout      : 'fit',
            stripeRows  : true,
            border      : false,
            store       : store,
            columns     : [
                {
                    xtype   : 'treecolumn', //this is so we know which column will show the tree
                    text    : i18n('sOwner'),
                    sortable: true,
                    flex    : 1,
                    dataIndex: 'username',
                    tdCls   : 'gridTree'
                }
            ],
            buttons: [
                {
                    xtype       : 'btnCommon',
                    itemId      : 'btnOwnerSelect',
                    listeners   : {
                        click       : 'onBtnOwnerSelectClick'
                    }
                }  
            ]
        }];           
        this.callParent(arguments);
    }
});
