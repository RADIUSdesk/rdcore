Ext.define('Rd.view.analytics.pnlDataUsage', {
    extend: 'Ext.container.Container',
    xtype: 'widgets',
    alias: 'widget.view.analytics.pnlDataUsage',


    layout: 'responsivecolumn',

    defaults: {
        xtype: 'container'
    },

    items: [

        

        {
            xtype: 'widget-e',
            containerColor: 'blue',
            flex: 1,
            itemId: "dataUsedTodayTotal",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Today',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'green',
            flex: 1,
            itemId: "dataUsed7daysPriorTotal",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Last 7 Days',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'orange',
            flex: 1,
            itemId: "dataUsedThisMonthTotal",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data This Month',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'pink',
            flex: 1,
            itemId: "dataUsedLastMonthTotal",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Last Month',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'blue',
            flex: 1,
            itemId: "dataUsedTodayDown",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Down Today',
                icon: 'download'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'green',
            flex: 1,
            itemId: "dataUsed7daysPriorDown",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Down Last 7 Days',
                icon: 'download'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'orange',
            flex: 1,
            itemId: "dataUsedThisMonthDown",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Down This Month',
                icon: 'download'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'pink',
            flex: 1,
            itemId: "dataUsedLastMonthDown",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Down Last Month',
                icon: 'upload'
            }
        },


        {
            xtype: 'widget-e',
            containerColor: 'blue',
            flex: 1,
            itemId: "dataUsedTodayUp",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Up Today',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'green',
            flex: 1,
            itemId: "dataUsed7daysPriorUp",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Up Last 7 Days',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'orange',
            flex: 1,
            itemId: "dataUsedThisMonthUp",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Up This Month',
                icon: 'upload'
            }
        },
        {
            xtype: 'widget-e',
            containerColor: 'pink',
            flex: 1,
            itemId: "dataUsedLastMonthUp",
            userCls: 'big-25 small-50 shadow-panel',
            shadow: true,
            data: {
                amount: 0,
                type: 'Total Data Up Last Month',
                icon: 'upload'
            }
        }
    ]
});

