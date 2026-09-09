Ext.define('Rd.view.permanentUsers.pnlPermanentUserGraphs', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlPermanentUserGraphs',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    controller  : 'vcPermanentUserGraphs',
    requires: [
        'Rd.view.components.pnlUsageGraph',
        'Rd.view.components.cntNavigation',
        'Rd.view.permanentUsers.vcPermanentUserGraphs'
    ],
    pu_name: undefined,
    timezone_id:  316, //London by default
    initComponent: function(){
        var me = this; 
        
        me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/permanent-users/nav-user-graphs.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdPermanentUserGraphs',
                flex    : 1,
                items   : [
                    {
                        itemId  : "daily",
                        xtype   : 'pnlUsageGraph',
                        span    : 'daily',
                        layout  : 'fit',
                        username: me.pu_name,
                        timezone_id : me.timezone_id,
                        type    : 'permanent'
                    },
                    {
                        itemId  : "weekly",
                        xtype   : 'pnlUsageGraph',
                        span    : 'weekly',
                        layout  : 'fit',
                        username: me.pu_name,
                        timezone_id : me.timezone_id,
                        type    : 'permanent'
                    },
                    {
                        itemId  : "monthly",
                        layout  : 'fit',
                        xtype   : 'pnlUsageGraph',
                        span    : 'monthly',
                        username: me.pu_name,
                        timezone_id : me.timezone_id,
                        type    : 'permanent'
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});
