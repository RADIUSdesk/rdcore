Ext.define('Rd.view.meshes.gridMeshViewNodes' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridMeshViewNodes',
    requires    : [
        'Rd.store.sMeshViewNodes',
        'Rd.model.mMeshViewNode',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridMeshViewNodes',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    viewConfig: {
        loadMask:true
    },
    features: [{
        //ftype: 'grouping',
        ftype               : 'groupingsummary',
        //groupHeaderTpl      : '<span style="color:green;">{name}</span><span style="color:grey;"> Last contact 2014-06-14 07:21</span>',
        groupHeaderTpl: [
            '<span class="{children:this.formatColor}">{name}</span><span class="grpInfo"> {children:this.getLastContact}</span>',
            {
                formatColor: function(children) {
                    var fc = children[0];
                    var state = fc.get('state');
                    if(state == 'never'){
                        return 'grpNever';
                    }
                    if(state == 'down'){
                        return 'grpDown';
                    }
                    if(state == 'up'){
                        return 'grpUp';
                    }
                }
            },
            {
                getLastContact: function(children) {
                    var fc = children[0];
                    var c = fc.get('l_contact_human');
                    if(c == null){
                        return '(never)';
                    }
                    return c;
                }
            }
        ],
        hideGroupedHeader   : true,
        enableGroupingMenu  : false,
        startCollapsed      : true
    }],
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sMeshViewNodes',{
            groupField: 'name',
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        //console.log(store.getProxy().getReader().rawData.message.message);
                    }else{
                        var count   = me.getStore().getTotalCount();
                        me.down('#count').update({count: count});
                    }   
                },
                update: function(store, records, success, options) {
                    store.sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sUpdated_item'),
                                i18n('sItem_has_been_updated'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );   
                        },
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_updating_the_item'),
                                i18n('sItem_could_not_be_updated'),
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });
                },
                scope: this
            },
            autoLoad: false 
        });
        
        me.store    = Ext.create('Rd.store.sMeshViewNodes',{});
        me.store.getProxy().setExtraParam('mesh_id',me.meshId);
              
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 displayInfo : true,
                 plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];

        me.columns  = [
        //    { xtype: 'rownumberer',                                                         stateId: 'StateGridMeshViewNodes1'},
            { text: i18n("sName"),      dataIndex: 'name',      tdCls: 'gridMain', flex: 1, stateId: 'StateGridMeshViewNodes2'},     
            {            
            	text		: 'Alias / MAC Address',
            	dataIndex	: 'mac',
            	tdCls		: 'gridTree',
            	flex		: 1,
            	stateId		: 'StateGridMeshViewNodes3',
            	xtype       : 'templatecolumn',
                tpl         : new Ext.XTemplate(
                    '<tpl if="cloud_flag & block_flag">',
                    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
                        '<br><span style="font-size:75%;color:#cc6600;"><i class="fa fa-cloud"></i>  <i class="fa fa-ban"></i></span>',
                  	'<tpl elseif="cloud_flag & firewall_flag">',
				    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
				    	'<br><span style="font-size:75%;color:#cc6600;"><i class="fa fa-cloud"></i>  <span style="font-family:FontAwesome;">&#xf06d;</span> {fw_profile}</span>',
                    '<tpl elseif="cloud_flag & limit_flag">',
                    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
                    	'<br><span style="font-size:75%;color:#cc6600;"><i class="fa fa-cloud"></i>  <span style="font-family:FontAwesome;">&#xf0e4;</span> (<i class="fa fa-arrow-circle-down"></i> {bw_down} / <i class="fa fa-arrow-circle-up"></i> {bw_up} )</span>',
                    '<tpl elseif="block_flag">',
                    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
                        '<br><span style="font-size:75%;color:#cc6600;"><i class="fa fa-ban"></i></span>',
                  	'<tpl elseif="firewall_flag">',
				    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
				        '<br><span style="font-size:75%;color:#cc6600;"><span style="font-family:FontAwesome;">&#xf06d;</span> {fw_profile}</span>',
                    '<tpl elseif="limit_flag">',
                    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
                        '<br><span style="font-size:75%;color:#cc6600;"><span style="font-family:FontAwesome;">&#xf0e4;</span> (<i class="fa fa-arrow-circle-down"></i> {bw_down} / <i class="fa fa-arrow-circle-up"></i> {bw_up} )</span>',
                    '<tpl else>',
                        '<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
                    '</tpl>'
                ),            
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
            { text: 'Vendor',           dataIndex: 'vendor',    tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshViewNodes4'},
            
            { 
                text        : 'Last Seen',    
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(v,metaData, record){
                    var value = record.get('client_state');
                    var last_contact_human     = record.get('l_modified_human');
                    if(value == 'up'){
                        return "<div class=\"fieldGreen\">"+last_contact_human+"</div>";
                    }
                    if(value == 'down'){
                        return "<div class=\"fieldGrey\">"+last_contact_human+"</div>";
                    }             
                },stateId: 'StateGridMeshViewNodesA'
            },  
            
            
            {   text: 'Data Tx',        dataIndex: 'tx_bytes',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshViewNodes5', itemId: 'txBytes',
                renderer    : function(value){
                    return Ext.ux.bytesToHuman(value)              
                },
                summaryType: 'sum',
                summaryRenderer : function(value){
                    return Ext.ux.bytesToHuman(value)
                }
            },
            {   text: 'Data Rx',        dataIndex: 'rx_bytes',  tdCls: 'gridTree', flex: 1, stateId: 'StateGridMeshViewNodes6',
                renderer    : function(value){
                    return Ext.ux.bytesToHuman(value)              
                },
                summaryType: 'sum',
                summaryRenderer : function(value){
                    return Ext.ux.bytesToHuman(value)
                }
            },
            {   text: 'Signal avg',       dataIndex: 'signal_avg',tdCls: 'gridTree', stateId: 'StateGridMeshViewNodes7',
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
                        }, 100);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }
            },
            {   text: 'Latest signal',       dataIndex: 'signal',    tdCls: 'gridTree', stateId: 'StateGridMeshViewNodes8',
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
                            var e       = r.get('l_entry');

                            var t  = Ext.create('Ext.tip.ToolTip', {
                                target  : id,
                                border  : true,
                                anchor  : 'left',
                                html    : [
                                    "<div>",
                                        "<h2>Latest connection detail</h2>",
                                        "<label class='lblTipItem'>Time</label><label class='lblTipValue'>"+t+"</label>",
                                        "<div style='clear:both;'></div>",
                                        "<label class='lblTipItem'>SSID</label><label class='lblTipValue'>"+e+"</label>",
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
                                    "</div>" 
                                ]
                            });

                        }, 100);
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
