Ext.define('Rd.view.meshes.pnlMeshNodeRogue', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlMeshNodeRogue',
    border      : true,
    nodeId      : undefined,
    border      : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    bodyStyle   : { backgroundColor : Rd.config.panelGrey },
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.meshes.vcMeshNodeRogue'
    ],
    controller  : 'vcMeshNodeRogue',
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/node-reports/menu-for-scans-for-node.json',
    initComponent: function() {
        var me      = this;
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.items    = [
            {
                xtype   : 'panel',
                //padding : 20,
                margin  : 20,
                itemId  : 'pnlSummary',
                tpl     :  new Ext.XTemplate(
                    "<tpl if='no_scan_data'>",
                        "<tpl if='awaiting'>",
                            '<div class="sectionHeader">',
                                '<h2>AWAITING RESULTS</h2>',
                            '</div>',
                            "<div style='background-color:white; padding:5px;'>",
                                "<p>",
                                "There are no previous results to display.<br>",
                                "A <b>Rogue AP Detection Scan</b> was initiated <span class='txtRed'><b>{awaiting_time_human}</b></span> ago.<br>",
                                "Click on the <b>Refresh</b> button to see if the results has arrived.<br>",
                                "</p>",
                                "<p>",
                                "Depending on the system setup it can be almost immediately (Realtime Systems)<br>",
                                "Or a couple of minutes (Standard Systems) after the scan has been initiated.<br>",
                                "</p>",
                            "</div>",
                        '<tpl else>',
                            '<div class="sectionHeader">',
                                '<h2>NO DATA AVAILABLE</h2>',
                            '</div>',
                            "<div style='background-color:white; padding:5px;'>",
                                "<p>",
                                "There are no previous results to display.<br>",
                                "Please initiate a <b>Rogue AP Detection Scan</b> by clicking the <b>Start Scan</b> button.<br>",
                                "Click on the <b>Refresh</b> button to see if the results has arrived.<br>",
                                "</p>",
                                "<p>",
                                "Depending on the system setup it can be almost immediately (Realtime Systems)<br>",
                                "Or a couple of minutes (Standard Systems) after the scan has been initiated.<br>",
                                "</p>",
                                "<p>",
                                "If you select to run a <b>ROUGE AP</b> scan, please note your WiFi clients will have <b>no access</b> to your WiFi network during the scan.",
                                "</p>", 
                            "</div>",    
                        '</tpl>',
                    '<tpl else>',
                        '<div class="sectionHeader">',
                            '<h2>REPORT SUMMARY</h2>',
                        '</div>',
                        "<div style='background-color:white; padding:5px;'>",
                            "<label class='lblMap txtBold'>Mesh </label><label class='lblValue txtBlue'> {mesh_name}</label>",
					        "<div style='clear:both;'></div>",
					        "<label class='lblMap txtBold'>Node </label><label class='lblValue txtBlue'> {node_name}</label>",
					        "<div style='clear:both;'></div>",
                            "<label class='lblMap txtBold'>Last Scan: </label><label class='lblValue txtBlue'> {last_scan_human}</label>",
					        "<div style='clear:both;'></div>",
                            "<label class='lblMap txtBold'>Rogue APs </label><label class='lblValue txtRed'> {rogue_ap_count}</label>",
					        "<div style='clear:both;'></div>",
					        "<label class='lblMap txtBold'>Awaiting Results </label>",
                            "<tpl if='awaiting'>",
                                "<label class='lblValue txtRed'><i class='fa fa-exclamation-circle'></i> YES (Initiated {awaiting_time_human})</label>",
                            '<tpl else>',
                                "<label class='lblValue txtGreen'><i class='fa fa-check-circle'></i> NO </label>",
                            "</tpl>",
					        "<div style='clear:both;'></div>",
					        "<label class='lblMap txtBold'>SSIDs </label>",
					        "<tpl for='entries'>",
					            "<label class='lblValue txtBlue'> {.}</label><br>",
					        "</tpl>",
                        "</div>",
                    "</tpl>"
                ),
                data: {},
                height: 200
            },
            {
                xtype   : 'gridMeshNodeRogue',
                nodeId  : me.nodeId,
                flex    : 1
            }  
        ]
        
        me.callParent(arguments);
    }
});
