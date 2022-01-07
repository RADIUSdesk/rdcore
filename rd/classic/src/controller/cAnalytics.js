Ext.define('Rd.controller.cAnalytics', {
    extend: 'Ext.app.Controller',
    actionIndex: function (pnl) {
        var me = this;

        if (me.populated) {
            return;
        }
        pnl.add({
            xtype: 'view.analytics.tbAnalitics',
            border: true,
            itemId: 'tabSsids',
            plain: true
        });
        me.populated = true;
    },
    config: {
        urlConnectedUsers: '/cake3/rd_cake/analytics/onlineusers.json',
        username: false,
        type: 'realm' //default is realm
    },
    stores: [
        'sAnalytics'
    ],
    views: [
        'analytics.pnlIndex'

    ],
    requires: [
        'Rd.view.widgets.WidgetE'

    ],
    refs: [
        {
            ref: 'totalMeshes',
            selector: '#totalMeshes'
        },
        {
            ref: 'totalNodes',
            selector: '#totalNodes'
        },
        {
            ref: "totalOnlineNode",
            selector: "#totalOnlineNode"
        }
        ,
        {
            ref: "totalOfflineNodes",
            selector: "#totalOfflineNodes"
        }
        ,
        {
            ref: "totalApProfiles",
            selector: "#totalApProfiles"
        }
        ,
        {
            ref: "totalAps",
            selector: "#totalAps"
        }
        ,
        {
            ref: "totalApsOnline",
            selector: "#totalApsOnline"
        }
        ,
        {
            ref: "totalApsOffline",
            selector: "#totalApsOffline"
        }
        ,
        {
            ref: "totalUnknownNodes",
            selector: "#totalUnknownNodes"
        },
        {
            ref: "totalUnknownAp",
            selector: "#totalUnknownAp"
        }
        ,
        {
            ref: "totalUsers",
            selector: "#totalUsers"
        }
        ,
        {
            ref: "totalSocialUsers",
            selector: "#totalSocialUsers"
        }
        ,
        {
            ref: "dataUsedTodayDown",
            selector: "#dataUsedTodayDown"
        }
        ,
        {
            ref: "dataUsed7daysPriorDown",
            selector: "#dataUsed7daysPriorDown"
        }
        ,
        {
            ref: "dataUsedThisMonthDown",
            selector: "#dataUsedThisMonthDown"
        }
        ,
        {
            ref: "dataUsedTodayUp",
            selector: "#dataUsedTodayUp"
        }
        ,
        {
            ref: "dataUsed7daysPriorUp",
            selector: "#dataUsed7daysPriorUp"
        }
        ,
        {
            ref: "dataUsedThisMonthUp",
            selector: "#dataUsedThisMonthUp"
        }
        ,
        {
            ref: "dataUsedTodayTotal",
            selector: "#dataUsedTodayTotal"
        }
        ,
        {
            ref: "dataUsed7daysPriorTotal",
            selector: "#dataUsed7daysPriorTotal"
        }
        ,
        {
            ref: "dataUsedThisMonthTotal",
            selector: "#dataUsedThisMonthTotal"
        }
        ,
        {
            ref: "dataUsedLastMonthUp",
            selector: "#dataUsedLastMonthUp"
        }
        ,
        {
            ref: "dataUsedLastMonthDown",
            selector: "#dataUsedLastMonthDown"
        }

        ,
        {
            ref: "dataUsedLastMonthTotal",
            selector: "#dataUsedLastMonthTotal"
        },
        {
            ref: 'pnlDataUsageDay',
            selector: 'pnlDataUsageDay'
        },
        {
            ref: 'pnlUsersOnlineGraph',
            selector: '#pnlUsersOnlineGraph'
        },
        {
            ref: 'pnlDataUsage',
            selector: 'pnlDataUsage'
        }
        ,
        {
            ref: 'pnlUsersOnline',
            selector: 'pnlUsersOnline'
        },
        {
            ref: 'dataInDay',
            selector: '#dataInDay'
        }
        ,
        {
            ref: 'dataOutDay',
            selector: '#dataOutDay'
        }




    ],

    listen: {

        //onBarClicked':alert("tetts")

    },
    onBarClicked: function () {
        alert("test")
    },
    addDays: function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    setMB: function (amount) {

        return Ext.ux.bytesToHuman(amount);
    },
    init: function () {
        var me = this;
        if (me.inited) {
            // return;
        }

        me.inited = true;
        me.lastDate = null;
        me.latestDate = null;

        me.fetchDataUsage(me.addDays(new Date(), -8), me.addDays(new Date(), 1));

        me.control({
            'pnlUsersOnline #back': {
                click: me.back
            },
            'pnlUsersOnline #forward': {
                click: me.forward
            }

        });


        // 'totalMeshes'                 => reset($resultsMeshes),
        //         'totalApProfiles'             => reset($resultsApProfiles),
        //         'totalAp'                     => reset($resultsAp), 
        //         'totalNodes'                  => reset($resultsNodes),
        //         'totalOfflineAP'              => reset($resultsOfflineAP),
        //         'totalOfflineNodes'           => reset($resultsOfflineNodes),
        //         'totalUnknownAP'              => reset($resultsUnknownAP),
        //         'totalUnknownNodes'           => reset($resultsUnKnownNodes),
        //         'totalUsers'                  => reset($resultsPermanentUsers),
        //         'totalSocialUsers'             => reset($resultsSocialUsers),

        me.getStore('sAnalytics').load({
            scope: this,
            callback: function (records, operation, success) {

                //Meshes
                var totalM = me.getTotalMeshes().getData();
                totalM.amount = records[0].data.totalMeshes;
                me.getTotalMeshes().setData(totalM)


                var totalNodes = me.getTotalNodes().getData();
                totalNodes.amount = records[0].data.totalNodes;
                me.getTotalNodes().setData(totalNodes)

                var totalOnlineNode = me.getTotalOnlineNode().getData();
                totalOnlineNode.amount = records[0].data.totalNodes - records[0].data.totalOfflineNodes < 0 ? 0 : records[0].data.totalNodes - records[0].data.totalOfflineNodes;
                me.getTotalOnlineNode().setData(totalOnlineNode)


                var totalOfflineNodes = me.getTotalOfflineNodes().getData();
                totalOfflineNodes.amount = records[0].data.totalOfflineNodes;
                me.getTotalOfflineNodes().setData(totalOfflineNodes)


                var totalUnknownNodes = me.getTotalUnknownNodes().getData();
                totalUnknownNodes.amount = records[0].data.totalUnknownNodes;
                me.getTotalUnknownNodes().setData(totalUnknownNodes)



                //App
                var totalApProfiles = me.getTotalApProfiles().getData();
                totalApProfiles.amount = records[0].data.totalApProfiles;
                me.getTotalApProfiles().setData(totalApProfiles)


                var totalAps = me.getTotalAps().getData();
                totalAps.amount = records[0].data.totalAp;
                me.getTotalAps().setData(totalAps)

                var totalApsOnline = me.getTotalApsOnline().getData();
                totalApsOnline.amount = records[0].data.totalAp - records[0].data.totalOfflineAP < 0 ? 0 : records[0].data.totalAp - records[0].data.totalOfflineAP;
                me.getTotalApsOnline().setData(totalApsOnline)


                var totalApsOffline = me.getTotalApsOffline().getData();
                totalApsOffline.amount = records[0].data.totalOfflineAP;
                me.getTotalApsOffline().setData(totalApsOffline)


                var totalUnknownAP = me.getTotalUnknownAp().getData();
                totalUnknownAP.amount = records[0].data.totalUnknownAP;
                me.getTotalUnknownAp().setData(totalUnknownAP)

                //Users         
                var totalUsers = me.getTotalUsers().getData();
                totalUsers.amount = records[0].data.totalUsers;
                me.getTotalUsers().setData(totalUsers)


                var totalSocialUsers = me.getTotalSocialUsers().getData();
                totalSocialUsers.amount = records[0].data.totalSocialUsers;
                me.getTotalSocialUsers().setData(totalSocialUsers)


                var totalSocialUsers = me.getTotalSocialUsers().getData();
                totalSocialUsers.amount = records[0].data.totalSocialUsers;
                me.getTotalSocialUsers().setData(totalSocialUsers)

                var dataUsedTodayDown = me.getDataUsedTodayDown().getData();
                dataUsedTodayDown.amount = me.setMB(records[0].data.dataUsedTodayDown);
                me.getDataUsedTodayDown().setData(dataUsedTodayDown)


                var dataUsed7daysPriorDown = me.getDataUsed7daysPriorDown().getData();
                dataUsed7daysPriorDown.amount = me.setMB(records[0].data.dataUsed7daysPriorDown);
                me.getDataUsed7daysPriorDown().setData(dataUsed7daysPriorDown)

                var dataUsedThisMonthDown = me.getDataUsedThisMonthDown().getData();
                dataUsedThisMonthDown.amount = me.setMB(records[0].data.dataUsedThisMonthDown);
                me.getDataUsedThisMonthDown().setData(dataUsedThisMonthDown)


                var dataUsedTodayUp = me.getDataUsedTodayUp().getData();
                dataUsedTodayUp.amount = me.setMB(records[0].data.dataUsedTodayUp);
                me.getDataUsedTodayUp().setData(dataUsedTodayUp)


                var dataUsed7daysPriorUp = me.getDataUsed7daysPriorUp().getData();
                dataUsed7daysPriorUp.amount = me.setMB(records[0].data.dataUsed7daysPriorUp);
                me.getDataUsed7daysPriorUp().setData(dataUsed7daysPriorUp)

                var dataUsedThisMonthUp = me.getDataUsedThisMonthUp().getData();
                dataUsedThisMonthUp.amount = me.setMB(records[0].data.dataUsedThisMonthUp);
                me.getDataUsedThisMonthUp().setData(dataUsedThisMonthUp)


                var dataUsedTodayTotal = me.getDataUsedTodayTotal().getData();
                dataUsedTodayTotal.amount = me.setMB(parseFloat(records[0].data.dataUsedTodayUp) + parseFloat(records[0].data.dataUsedTodayDown));
                me.getDataUsedTodayTotal().setData(dataUsedTodayTotal)


                var dataUsed7daysPriorTotal = me.getDataUsed7daysPriorTotal().getData();
                dataUsed7daysPriorTotal.amount = me.setMB(parseFloat(records[0].data.dataUsed7daysPriorUp) + parseFloat(records[0].data.dataUsed7daysPriorDown));
                me.getDataUsed7daysPriorTotal().setData(dataUsed7daysPriorTotal)

                var dataUsedThisMonthTotal = me.getDataUsedThisMonthTotal().getData();
                dataUsedThisMonthTotal.amount = me.setMB(parseFloat(records[0].data.dataUsedThisMonthUp) + parseFloat(records[0].data.dataUsedThisMonthDown));
                me.getDataUsedThisMonthTotal().setData(dataUsedThisMonthTotal)

                var dataUsedLastMonthTotal = me.getDataUsedLastMonthTotal().getData();
                dataUsedLastMonthTotal.amount = me.setMB(parseFloat(records[0].data.dataUsedLastMonthDown) + parseFloat(records[0].data.dataUsedLastMonthUp));
                me.getDataUsedLastMonthTotal().setData(dataUsedLastMonthTotal)

                var dataUsedLastMonthUp = me.getDataUsedLastMonthUp().getData();
                dataUsedLastMonthUp.amount = me.setMB(parseFloat(records[0].data.dataUsedLastMonthUp));
                me.getDataUsedLastMonthUp().setData(dataUsedLastMonthUp)

                var dataUsedLastMonthDown = me.getDataUsedLastMonthDown().getData();
                dataUsedLastMonthDown.amount = me.setMB(parseFloat(records[0].data.dataUsedLastMonthDown));
                me.getDataUsedLastMonthDown().setData(dataUsedLastMonthDown);

                // me.getTotalMeshes().update("<h2>Total Meshes:" +  records[0].data.totalMeshes + "</h2>" +
                //                            "<h3>Total Nodes:"+ records[0].data.totalNodes  +"</h3>" +
                //                            "<h3>Total Offline Nodes:"+ records[0].data.totalOfflineNodes  +"</h3>" +
                //                            "<h3>Total Unknown Nodes:"+ records[0].data.totalUnknownNodes  +"</h3>" 
                //                             );  

                // me.getTotalAP().update("<h2>Total AP Profiles:" +  records[0].data.totalApProfiles + "</h2>" +
                //                         "<h3>Total APs:"+ records[0].data.totalAp  +"</h3>" +
                //                         "<h3>Total Offline APs:"+ records[0].data.totalOfflineAP  +"</h3>" +
                //                         "<h3>Total Unknown APs:"+ records[0].data.totalUnknownAP  +"</h3>" 
                //                          );    

                // me.getTotalUsers().update("<h2>Total Users:"+  records[0].data.totalUsers   + "</h2>" +
                //                           "<h3>Total Social Media Users:"+ records[0].data.totalSocialUsers  +"</h3>"
                //                         )

            }


        });

        // me.control();


        // me.control();
    },
    lastDate: {},
    latestDate: {},
    barClicked: function (obj) {
        console.log(obj);
    },

    back: function () {
        var me = this;
        me.fetchDataUsage(me.addDays(me.lastDate, -8), me.addDays(me.lastDate, -1))
    },
    forward: function () {
        var me = this
        date1 = new Date()
        date2 = new Date(me.latestDate)
        date1.setHours(0, 0, 0, 0)
        date2.setHours(0, 0, 0, 0)

        if (date1 != date2) {

            me.fetchDataUsage(me.addDays(me.latestDate, 1), me.addDays(me.latestDate, 8))
        }

    },

    fetchDataUsage: function (startDate, endDate) {
        var me = this;

        // me.getPnlDataUsage().setLoading(true);
        Ext.Ajax.request({
            url: me.getUrlConnectedUsers(),
            params: {
                start: startDate,
                end: endDate

            },
            method: 'GET',
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);

                me.getPnlDataUsage().setLoading(false);

                if (jsonData.success) {
                    if (jsonData.items[0] != undefined) {
                        me.lastDate = jsonData.items[0].timestamp;
                    }
                    if (jsonData.items[jsonData.items.length - 1] != undefined) {

                        me.latestDate = jsonData.items[jsonData.items.length - 1].timestamp;
                    }

                    me.getPnlUsersOnlineGraph().getStore().setData(jsonData.items);

                    window.barClicked = function (dataIn, dataOut,day) {
                        var dataInDay = me.getDataInDay().getData();
                        dataInDay.amount = me.setMB(dataIn);
                        dataInDay.type = "Data Downloaded on " + day;
                        me.getDataInDay().setData(dataInDay)


                        var dataOutDay = me.getDataOutDay().getData();
                        dataOutDay.amount = me.setMB(dataOut);
                        dataOutDay.type = "Data Uploaded on " + day;
                        me.getDataOutDay().setData(dataOutDay)
                    }


                    //  me.getPnlDataUsageGraph().draw();
                }
                else {

                }
            }
        });
    }
}

);

