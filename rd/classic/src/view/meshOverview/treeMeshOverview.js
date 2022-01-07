Ext.define('Rd.view.meshOverview.treeMeshOverview' ,{
    extend      :'Ext.tree.Panel',
    useArrows   : true,
    alias       : 'widget.treeMeshOverview',
    rootVisible : false,
    rowLines    : true,
    border      : false,
    listeners   : {
        select : 'onTreeNodeSelect'
    },
    store       : Ext.create('Ext.data.TreeStore', {
        proxy   : {
            type    : 'ajax',
            //url     : '/cake3/rd_cake/tree-tags/index_mesh_overview.json',
            url     : '/cake3/rd_cake/clouds/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                totalProperty   : 'total',
                successProperty : 'success',
            }
        },
        rootProperty: 'items'
    })
});
