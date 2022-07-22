Ext.define('Rd.view.dynamicClients.pnlDynamicClient', {
    extend              : 'Ext.tab.Panel',
    alias               : 'widget.pnlDynamicClient',
    border              : false,
    dynamic_client_id   : null,
    record              : null, //We will supply each instance with a reference to the selected record.
    plain               : true,
    cls                 : 'subTab',
    initComponent: function(){
        var me      = this;
        me.items    = [
            {
                title               : "Dynamic Client",
                itemId              : "tabDynamicClient",
                xtype               : "pnlDynamicClientDynamicClient",
                dynamic_client_id   : me.dynamic_client_id
            },
            {
                title               : "Realms",
                itemId              : "tabRealms",
                layout              : "fit",
                border              : false,
                xtype               : 'pnlRealmsForDynamicClientOwner',
                record              : me.record,
                dynamic_client_id   : me.dynamic_client_id
            },
            {
                title               : "Photo",
                itemId              : "tabPhoto",
                xtype               : "pnlDynamicClientPhoto",
                dynamic_client_id   : me.dynamic_client_id
            }
        ];
        me.callParent(arguments);
    }
});
