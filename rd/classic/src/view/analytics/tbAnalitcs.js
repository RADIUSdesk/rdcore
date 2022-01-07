Ext.define('Rd.view.analytics.tbAnalitics', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.view.analytics.tbAnalitics',
    border: false,
    dynamic_client_id: null,
    record: null, //We will supply each instance with a reference to the selected record.
    plain: true,
    cls: 'subTab',
    initComponent: function () {
        var me = this;
        me.items = [
            {
                title: "Dashboard",
                itemId: "tabDashboard",
                xtype: "view.analytics.pnlIndex",
                dynamic_client_id: me.dynamic_client_id
            },
            {
                title: "Data Usage",
                itemId: "tabDataUsage",
                xtype: "view.analytics.pnlDataUsage",
                dynamic_client_id: me.dynamic_client_id
            },
            {
                title: "Users Online",
                itemId: "tabUsers",
                xtype: "pnlUsersOnline",
                dynamic_client_id: me.dynamic_client_id
            }
        ];
        me.callParent(arguments);
    }
});
