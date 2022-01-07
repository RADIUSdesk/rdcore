Ext.define('Rd.view.analytics.pnlDataUsageDay', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.analytics.pnlDataUsageDay',
    //ui      : 'light',

    height: 550,
    margin: 0,
    padding: 0,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    itemId: "pnlDataDay",
    initComponent: function () {
        var me = this;


        me.items = [

            {
                xtype: 'panel',
                flex: 1,
                border: false,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'analytics.pnlUsersOnlineGraph',
                        flex: 3,
                        margin: 5,
                        padding: 5,
                        layout: 'fit',
                        border: false

                    },

                    {
                        xtype: 'panel',
                        flex: 1,
                        border: false,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {

                                xtype: 'widget-e',
                                containerColor: 'green',

                                itemId: "dataInDay",
                                userCls: 'big-50 small-50 shadow-panel',
                                shadow: true,
                                data: {
                                    amount: 0,
                                    type: 'Total Data Down',
                                    icon: 'upload'
                                }

                            }
                            ,
                            {
                                xtype: 'widget-e',
                                containerColor: 'pink',

                                itemId: "dataOutDay",
                                userCls: 'big-50 small-50 shadow-panel',
                                shadow: true,
                                data: {
                                    amount: 0,
                                    type: 'Total Data Up',
                                    icon: 'upload'
                                }

                            }

                        ]
                    }



                ]
            }

        ];
        me.callParent(arguments);
    }
});

