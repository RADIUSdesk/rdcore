Ext.define('Rd.view.mikrotik.pnlMikrotikApi', {
    extend              : 'Ext.tab.Panel',
    alias               : 'widget.pnlMikrotikApi',
    border              : false,
    dynamic_client_id   : null,
    record              : null, //We will supply each instance with a reference to the selected record.
    plain               : true,
    cls                 : 'subTab',
    initComponent: function(){
        var me      = this;
        me.items    = [
            {
                title               : 'Hotspot Active',
                itemId              : 'tabMtHotspotActive',
                xtype               : 'gridMtHotspotActive',
                dynamic_client_id   : me.dynamic_client_id,
                padding             : Rd.config.gridSlim
            },
            {
                title               : 'PPPoE Active',
                itemId              : 'tabMtPppoeActive',
                xtype               : 'gridMtPppoeActive',
                dynamic_client_id   : me.dynamic_client_id,
                padding             : Rd.config.gridSlim
            }
        ];
        me.callParent(arguments);
    }
});
