Ext.define('Rd.view.aps.pnlAccessPointView', {
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.pnlAccessPointView',
    border      : false,
    plain       : true,
    cls         : 'subTab',
    tabPosition : 'top',
    ap_id       : undefined,
    apName      : undefined,
    requires    : [
        'Rd.view.aps.pnlApViewEntries',
        'Rd.view.aps.pnlApViewHardware',
        'Rd.view.aps.gridApViewActions'
    ],
    initComponent: function() {
        var me      = this;
        me.items    = [
            {
                title   : 'SSID &#8660; Device',
                itemId  : 'tabApViewEntries',
                xtype   : 'pnlApViewEntries',
                apId    : me.ap_id
            },
		    {
                title   : 'Hardware',
                itemId  : 'tabApViewHardware',
                xtype   : 'pnlApViewHardware',
                apId    : me.ap_id
            },
            {
                title   : "Command Execution",
                itemId  : 'tabApViewActions',
                xtype   : 'gridApViewActions',
                apId    : me.ap_id
            }              
        ];
        me.callParent(arguments);
    }
});
