Ext.define('Rd.view.clients.pnlClients', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlClients',
    border	: false,
    plain	: true,
    cls     : 'subSubTab',
    padding : 0,
    margin  : 0,
    tabBar: {
        items: [
            { 
                xtype   : 'btnOtherBack'
            }              
       ]
    },
    requires: [
         'Rd.view.clients.gridClients'
    ],
    initComponent: function(){
        var me      = this;
        me.items = [
        {   
            title   : 'Clients',
            xtype   : 'gridClients'
        }    
    ]; 
        me.callParent(arguments);
    }
});
