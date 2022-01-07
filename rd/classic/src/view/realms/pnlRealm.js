Ext.define('Rd.view.realms.pnlRealm', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.pnlRealm',
    border: false,
    realm_id: null,
    plain   : true,
    initComponent: function(){
        var me = this;
        me.items = [
            {   
                title:  i18n('sDetail'),
                xtype:  'pnlRealmDetail',
                itemId: 'tabDetail'       
            },
            { 
                title   : i18n('sLogo'),
                itemId  : 'tabLogo',
                xtype   : 'pnlRealmLogo'
            },
            { 
                title   : i18n('sUsage_graphs'), 
                layout  : 'fit',
                xtype   : 'tabpanel',
                itemId  : 'pnlUsageGraphs',
                margins : '0 0 0 0',
                plain   : true,
                border  : true,
                tabPosition: 'bottom',
                items   :   [
                    {
                        title   : i18n('sDaily'),
                        itemId  : "daily",
                        xtype   : 'pnlUsageGraph',
                        span    : 'daily',
                        layout  : 'fit',
                        username: me.realm_id,
                        type    : 'realm'
                    },
                    {
                        title   : i18n('sWeekly'),
                        itemId  : "weekly",
                        xtype   : 'pnlUsageGraph',
                        span    : 'weekly',
                        layout  : 'fit',
                        username: me.realm_id,
                        type    : 'realm'
                    },
                    {
                        title   : i18n('sMonthly'),
                        itemId  : "monthly",
                        layout  : 'fit',
                        xtype   : 'pnlUsageGraph',
                        span    : 'monthly',
                        username: me.realm_id,
                        type    : 'realm'
                    }
                ]
            }      
        ]; 
        me.callParent(arguments);
    }
});
