Ext.define('Rd.view.analytics.pnlIndex', {
    extend: 'Ext.container.Container',
    xtype: 'widgets',
    alias: 'widget.view.analytics.pnlIndex',


    layout: 'responsivecolumn',

    defaults: {
        xtype: 'container'
    },

    items: [

        {
            xtype: 'widget-e',
            containerColor: 'cornflower-blue',
            userCls: 'big-20 small-50 totalMeshes shadow-panel',
            flex: 1,
            shadow: true,
            itemId: "totalMeshes",
            alias: 'widget.view.analytics.totalMeshes',
            data: {
                amount: 0,
                type: 'Mesh Networks',
                icon: 'connectdevelop'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'orange',
            flex: 1,
            itemId: "totalNodes",
            userCls: 'big-20 small-50  shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Nodes',
                icon: 'cube'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'green',
            flex: 1,
            itemId: "totalOnlineNode",
            shadow: true,
            userCls: 'big-20 small-50  shadow-panel',
            data: {
                amount: 0,
                type: 'Online Nodes',
                icon: 'wifi'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'red',
            flex: 1,
            shadow: true,
            itemId: "totalOfflineNodes",
            userCls: 'big-20 small-50  shadow-panel',
            data: {
                amount: 0,
                type: 'Offline Nodes',
                icon: 'compress '
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'magenta',
            shadow: true,
            flex: 1,
            itemId: "totalUnknownNodes",
            userCls: 'big-20 small-50 shadow-panel',
            data: {
                amount: 0,
                type: 'Nodes Not Configured',
                icon: 'unlink '
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'cornflower-blue',
            shadow: true,
            flex: 1,
            itemId: "totalApProfiles",
            userCls: 'big-20 small-50 shadow-panel',
            data: {
                amount: 0,
                type: 'Access Point Profiles',
                icon: 'cloud'
            }
        },
        {
            xtype: 'widget-e',
            shadow: true,
            flex: 1,
            itemId: "totalAps",
            containerColor: 'orange',
            userCls: 'big-20 small-50 shadow-panel',
            data: {
                amount: 0,
                type: 'Access Points',
                icon: 'cube'
            }
        },
        {
            xtype: 'widget-e',
            flex: 1,
            itemId: "totalApsOnline",
            shadow: true,
            containerColor: 'green',
            userCls: 'big-20 small-50 shadow-panel',
            data: {
                amount: 0,
                type: 'Online Access Points',
                icon: 'wifi'
            }
        },
        {
            xtype: 'widget-e',
            flex: 1,
            itemId: "totalApsOffline",
            containerColor: 'red',
            userCls: 'big-20 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Offline Access Points',
                icon: 'compress'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'magenta',
            flex: 1,
            itemId: "totalUnknownAp",
            userCls: 'big-20 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Access Points Not Configured',
                icon: 'unlink'
            }
        },
   
        {
            xtype: 'widget-e',
            containerColor: 'green',
            flex: 1,
            itemId: "totalUsers",
            userCls: 'big-50 small-50  shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Users',
                icon: 'user'
            }
        },

        ,
        {
            xtype: 'widget-e',
            containerColor: 'orange',
            flex: 1,
            itemId: "totalSocialUsers",
            userCls: 'big-50 small-50  shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Social Media Users',
                icon: 'facebook'
            }
        }

    ]
});

