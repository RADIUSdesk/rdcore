Ext.define('Rd.view.dynamicClients.pnlDynamicClientAvailable', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlDynamicClientAvailable',
    layout  : 'fit',
    margin  : '0 0 0 0',
    plain   : true,
    border  : false,
    tabPosition: 'top',
    cls     : 'subTab',
    dynamic_client_id : null,
    initComponent: function(){
        var me      = this;      
        me.items    =   [
            {
                title   : 'Overview',
                itemId  : "overview",
                xtype   : 'gridDynamicClientsAvailability',
                dynamic_client_id   : me.dynamic_client_id
            },
            {
                title   : 'Raw Detail',
                itemId  : "detail",
                xtype   : 'gridDynamicClientsAvailableRaw',
                dynamic_client_id   : me.dynamic_client_id
            }
        ];
        me.callParent(arguments);
    }
});
