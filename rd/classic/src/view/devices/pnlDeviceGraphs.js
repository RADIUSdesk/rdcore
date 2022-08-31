Ext.define('Rd.view.devices.pnlDeviceGraphs', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlDeviceGraphs',
    layout  : 'fit',
    margin  : '0 0 0 0',
    plain   : true,
    border  : false,
    tabPosition: 'top',
    cls     : 'subTab',
    requires: [
        'Rd.view.components.pnlUsageGraph'
    ],
    d_name: undefined,
    timezone_id:  316, //London by default
    initComponent: function(){
        var me = this;      
        me.items   =   [
            {
                title   : i18n('sDaily'),
                itemId  : "daily",
                xtype   : 'pnlUsageGraph',
                span    : 'daily',
                layout  : 'fit',
                username: me.d_name,
                timezone_id : me.timezone_id,
                type    : 'device'
            },
            {
                title   : i18n('sWeekly'),
                itemId  : "weekly",
                xtype   : 'pnlUsageGraph',
                span    : 'weekly',
                layout  : 'fit',
                username: me.d_name,
                timezone_id : me.timezone_id,
                type    : 'device'
            },
            {
                title   : i18n('sMonthly'),
                itemId  : "monthly",
                layout  : 'fit',
                xtype   : 'pnlUsageGraph',
                span    : 'monthly',
                username: me.d_name,
                timezone_id : me.timezone_id,
                type    : 'device'
            }
        ];
        me.callParent(arguments);
    }
});
