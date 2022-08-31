Ext.define('Rd.view.meshes.winMeshEditTreeTag', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winMeshEditTreeTag',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Change Grouping',
    width       : 400,
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
        var me = this;
        var scrnTreeTags   = me.mkScrnTreeTags();
        me.items = [
            scrnTreeTags
        ];  
        me.callParent(arguments);
    },

    //____ AccessProviders tree SCREEN ____
    mkScrnTreeTags: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlTreeTags',{
            itemId: 'scrnTreeTags',
            border: false
        });
        return pnlTree;
    }
});
