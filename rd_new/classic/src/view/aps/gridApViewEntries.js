Ext.define('Rd.view.aps.gridApViewEntries' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridApViewEntries',
    requires    : [
        'Rd.store.sApViewEntries',
        'Rd.model.mApViewEntry',
        'Rd.view.aps.vcApViewEntries'
    ],
    controller  : 'vcApViewEntries',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridApViewEntries',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    viewConfig: {
        loadMask:true
    },
    apId: '', //To remember
    features: [{
        //ftype: 'grouping',
        ftype               : 'groupingsummary',
        groupHeaderTpl      : '{name}',
        hideGroupedHeader   : true,
        enableGroupingMenu  : false,
        startCollapsed      : true
    }],
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Rd.store.sApViewEntries,{});
        me.store.getProxy().setExtraParam('ap_id',me.apId);
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];

        me.columns  = [
         //   { xtype: 'rownumberer',                                                         stateId: 'StateGridApViewEntries1'},
            { text: i18n("sSSID"),         dataIndex: 'name',      tdCls: 'gridMain', flex: 1, stateId: 'StateGridApViewEntries2'},     
            { text: i18n("sMAC_address"),  dataIndex: 'mac',       tdCls: 'gridTree', flex: 1, stateId: 'StateGridApViewEntries3',
                summaryType     : 'count',
                summaryRenderer : function(value, summaryData) {
                    var tx_bytes =summaryData.txBytes; 
                    if(tx_bytes == 0){
                        return 'No devices';
                    }else{
                        return ((value === 0 || value > 1) ? '(' + value + ' Devices)' : '(1 Device)');
                    }
                }
            },
            { text: 'Vendor',           dataIndex: 'vendor',    tdCls: 'gridTree', flex: 1, stateId: 'StateGridApViewEntries4'},
            {   text: 'Data Tx',        dataIndex: 'tx_bytes',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridApViewEntries5', itemId: 'txBytes',
                renderer    : function(value){
                    return Ext.ux.bytesToHuman(value)              
                },
                summaryType: 'sum',
                summaryRenderer : function(value){
                    return Ext.ux.bytesToHuman(value)
                }
            },
            {   text: 'Data Rx',        dataIndex: 'rx_bytes',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridApViewEntries6',
                renderer    : function(value){
                    return Ext.ux.bytesToHuman(value)              
                },
                summaryType: 'sum',
                summaryRenderer : function(value){
                    return Ext.ux.bytesToHuman(value)
                }
            },
            {   text: 'Signal avg',       dataIndex: 'signal_avg',tdCls: 'gridTree', stateId: 'StateGridApViewEntries7',
                width: 150,
                renderer: function (v, m, r) {
                    if(v != null){
                        var bar = r.get('signal_avg_bar');
                        var cls = 'wifigreen';
                        if(bar < 0.3){
                            cls = 'wifired';   
                        }
                        if((bar > 0.3)&(bar < 0.5)){
                            cls = 'wifiyellow';
                        } 
                        var id = Ext.id();
                        Ext.defer(function () {
                            Ext.widget('progressbarwidget', {
                                renderTo    : id,
                                value       : bar,
                                width       : 140,
                                text        : v+" dBm",
                                cls         : cls
                            });
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }
            },
            {   text: 'Latest signal',       dataIndex: 'signal',    tdCls: 'gridTree', stateId: 'StateGridApViewEntries8',
                width: 150,
                renderer: function (v, m, r) {
                    if(v != null){
                        var bar = r.get('signal_bar');
                        var cls = 'wifigreen';
                        if(bar < 0.3){
                            cls = 'wifired';   
                        }
                        if((bar >= 0.3)&(bar <= 0.5)){
                            cls = 'wifiyellow';
                        } 
                        var id = Ext.id();
                        Ext.defer(function () {
                            var p = Ext.widget('progressbarwidget', {
                                renderTo    : id,
                                value       : bar,
                                width       : 140,
                                text        : v+" dBm",
                                cls         : cls
                            });
                        
                            //Fetch some variables:
                            var txbr    = r.get('l_tx_bitrate');
                            var rxbr    = r.get('l_rx_bitrate');
                            var t       = r.get('l_modified_human');
                            var ltx     = Ext.ux.bytesToHuman(r.get('l_tx_bytes'));
                            var lrx     = Ext.ux.bytesToHuman(r.get('l_rx_bytes'));
                            var tx_f    = r.get('l_tx_failed');
                            var tx_r    = r.get('l_tx_retries');
                            var auth    = r.get('l_authenticated');
                            var authz   = r.get('l_authorized');
                            var n       = r.get('l_node');

                            var t  = Ext.create('Ext.tip.ToolTip', {
                                target  : id,
                                border  : true,
                                anchor  : 'left',
                                html    : [
                                     "<div>",
                                        "<h2>Latest connection detail</h2>",
                                        "<label class='lblTipItem'>Time</label><label class='lblTipValue'>"+t+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Tx Speed</label><label class='lblTipValue'>"+txbr+"Mb/s</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Rx Speed</label><label class='lblTipValue'>"+rxbr+"Mb/s</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Tx bytes</label><label class='lblTipValue'>"+ltx+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Rx bytes</label><label class='lblTipValue'>"+lrx+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Tx failed</label><label class='lblTipValue'>"+tx_f+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Tx retries</label><label class='lblTipValue'>"+tx_r+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Authenticated</label><label class='lblTipValue'>"+auth+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>Authorized</label><label class='lblTipValue'>"+authz+"</label>",
                                        "<div style='clear:both;'></div>",
                                    "</div>" 
                                ]
                            });

                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }
            }
        ];
        me.callParent(arguments);
    }
});
