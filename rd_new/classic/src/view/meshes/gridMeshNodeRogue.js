Ext.define('Rd.view.meshes.gridMeshNodeRogue' ,{
    extend		: 'Ext.grid.Panel',
    alias 		: 'widget.gridMeshNodeRogue',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'StateGridMeshNodeRogue',
    stateEvents	: ['groupclick','columnhide'],
    border		: true,
    nodeId      : undefined,
    viewConfig  : {
        loadMask:true
    },
    emptyText   : "No Data Captured",
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
		me.store    = Ext.create(Rd.store.sMeshNodeRogues,{
            listeners: {
                load: function(store, records, successful) {
                    var pnl     = me.up("pnlMeshNodeRogue");
                    var btnGrp  = pnl.down('buttongroup');
                    var btnScan = btnGrp.down('#start_scan');
                    var btnDel  = btnGrp.down('#remove');
                    var md      = store.getProxy().getReader().metaData;
                    if(md.awaiting){
                        btnScan.setDisabled(true);
                    }else{
                        btnScan.setDisabled(false);
                    } 
                    if(md.no_scan_data){
                        me.hide();
                        btnDel.setDisabled(true);
                    }else{
                        me.show();
                        btnDel.setDisabled(false);
                    }        
                    pnl.down('#pnlSummary').setData(md);
                },
                scope: me
            },
            autoLoad: true 
        });
        
        me.store.getProxy().setExtraParam('node_id',me.nodeId);
        
        me.columns  = [
 			{ 
				text		: 'SSID',      	
				dataIndex	: 'ssid',          
				tdCls       : 'gridMain',
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<tpl if="ssid">',
                        '{ssid}',
                    '<tpl else>',
                        '(HIDDEN SSID)',     
                    '</tpl>'
                ),        
				flex		: 1,
				stateId     : 'NodeR1',
				filter      : {type: 'string'}
			},
			{ 
				text		: 'Channel',      	
				dataIndex	: 'channel',          
				tdCls		: 'gridTree',
				width       : 100,
				stateId     : 'NodeR2',
				xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<div class="fieldBlueWhite">{channel}</div>'
                )
			},
			{ 
				text		: 'Mode',      	
				dataIndex	: 'mode',          
				tdCls		: 'gridTree', 
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="mode==\'Master\'">',
                        '<tpl if="rogue_flag">',
                            '<div class="fieldRed"><i class="fa  fa-wifi "></i> AP </div>',
                        '<tpl else>',
                            '<div class="fieldGrey"><i class="fa  fa-wifi "></i> AP </div>',
                        '</tpl>',
                    '</tpl>',
                    '<tpl if="mode==\'Mesh Point\'">',
                        '<div class="fieldBlue"><i class="fa fa-connectdevelop"></i> MESH </div>',
                    '</tpl>'
                ),
                width       : 150,      
				stateId     : 'NodeR3'
			},
			{ 
                text        : 'Encryption',   
                dataIndex   : 'encryption',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(v,metaData, record){
                    //console.log(record.get('encryption'));
                    if(v.enabled){
                        return "<div class=\"fieldBlue\">"+v.description+"</div>";
                    }else{
                        return "<div class=\"fieldOrange\">"+v.description+"</div>";
                    }
                                  
                },stateId: 'NodeR4'
            },
            {   
                text        : 'Signal', 
                dataIndex   : 'signal',
                tdCls       : 'gridTree',
                stateId     : 'NodeR5',
                width       : 200,
                renderer: function (v, m, r) {
                    if(v != null){
                        var bar     = r.get('signal_bar');
                        var qt_max  = r.get('quality_max');
                        var qt      = r.get('quality')
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
                                width       : 190,
                                text        : v+' dBm ('+qt+'/'+qt_max+')',
                                cls         : cls
                            });
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }else{
                        return "N/A";
                    }
                }
            },
            { 
				text		: 'BSSID',      	
				dataIndex	: 'bssid',          
				tdCls		: 'gridTree', 
				flex		: 1,
				hidden      : true,
				stateId     : 'NodeR6'
			},
			{ 
				text		: 'MAC',      	
				dataIndex	: 'mac',          
				tdCls		: 'gridTree', 
				flex		: 1,
				hidden      : true,
				stateId     : 'NodeR7'
			},
			{ 
				text		: 'MAC Vendor',      	
				dataIndex	: 'mac_vendor',          
				tdCls		: 'gridTree', 
				flex		: 1,
				hidden      : true,
				stateId     : 'NodeR8'
			}
        ];
        me.callParent(arguments);
    }
});
