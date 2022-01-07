Ext.define('Rd.view.treeTags.pnlTreeAndMap' ,{
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlTreeAndMap',
    layout      : {
   
        type    : 'hbox',
        align   : 'stretch'
    },
    items       : [
        {
            xtype    : 'treeTreeTags',
            flex     : 1,
            border   : true,
            frame    : true
        },
        {
            xtype   : 'panel',
            itemId  : 'pnlMap',
            layout  : 'fit', 
            flex    : 1,
            border  : true,
            frame   : true
        }
    ]
});
