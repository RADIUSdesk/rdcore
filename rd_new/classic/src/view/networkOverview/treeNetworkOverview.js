Ext.define('Rd.view.networkOverview.treeNetworkOverview' ,{
    extend      :'Ext.tree.Panel',
    useArrows   : true,
    alias       : 'widget.treeNetworkOverview',
    rootVisible : false,
    rowLines    : true,
    border      : false,
    location    : 'overview',
    initComponent: function(){
        var me = this;
        me.store  = Ext.create('Ext.data.TreeStore', {
            proxy   : {
                type    : 'ajax',
                url     : '/cake3/rd_cake/clouds/index-online.json',
                extraParams: {'location': me.location},
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    totalProperty   : 'total',
                    successProperty : 'success',
                }
            },
            rootProperty: 'items'
        });
        me.callParent(arguments); 
    }
});
