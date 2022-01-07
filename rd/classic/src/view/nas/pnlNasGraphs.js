Ext.define('Rd.view.nas.pnlNasGraphs', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlNasGraphs',
    layout  : 'fit',
    margin  : '0 0 0 0',
    plain   : true,
    border  : false,
    tabPosition: 'top',
    nas_id  : undefined,
    cls     : 'subTab',
    initComponent: function(){
        var me = this;      
        me.items   =   [
            {
                title   : i18n('sDaily'),
                itemId  : "daily",
                xtype   : 'pnlUsageGraph',
                span    : 'daily',
                layout  : 'fit',
                username: me.nas_id,
                type    : 'nas'
            },
            {
                title   : i18n('sWeekly'),
                itemId  : "weekly",
                xtype   : 'pnlUsageGraph',
                span    : 'weekly',
                layout  : 'fit',
                username: me.nas_id,
                type    : 'nas'
            },
            {
                title   : i18n('sMonthly'),
                itemId  : "monthly",
                layout  : 'fit',
                xtype   : 'pnlUsageGraph',
                span    : 'monthly',
                username: me.nas_id,
                type    : 'nas'
            }
        ];
        me.callParent(arguments);
    }
});
