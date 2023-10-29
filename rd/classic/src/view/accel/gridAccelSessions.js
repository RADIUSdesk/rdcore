Ext.define('Rd.view.accel.gridAccelSessions' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccelSessions',
    multiSelect : true,
    store       : 'sAccelServers',
    stateful    : true,
    stateId     : 'StateGridAccelSessions',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    plugins     : [
        'gridfilters'
    ],
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.accel.vcAccelSessions',
    ],
    controller  : 'vcAccelSessions',
    urlMenu     : '/cake4/rd_cake/accel-sessions/menu-for-grid.json',  
    initComponent: function(){
        var me      = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.store   = Ext.create('Rd.store.sAccelSessions');
        me.store.getProxy().setExtraParam('accel_server_id',me.srv_id);
        me.store.load();
        
        
        me.store.addListener('metachange',  me.onStoreAccelSessionsMetachange, me);
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
               
        me.columns  = [
            { 
                text        : 'Username',               
                dataIndex   : 'username',
                tdCls       : 'gridMain', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn1',
                renderer    : function(value,metaData, record){
                	var disconnect_flag = record.get('disconnect_flag');
                	var value           = record.get('username');
                	if(disconnect_flag == 1){
                	    return "<i class=\"fa fa-chain-broken\" style=\"color:orange;\"></i> "+value;
                	}
                    return value;	             
                }
            },
            { 
                text        : 'IP Address',               
                dataIndex   : 'ip',
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2'
            },
            { 
                text        : 'Calling SID',               
                dataIndex   : 'calling_sid',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2a'
            },
            { 
                text        : 'Called SID',               
                dataIndex   : 'called_sid',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2b'
            },
            { 
                text        : 'Rx Packets',               
                dataIndex   : 'rx_pkts',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2c'
            },
            { 
                text        : 'Tx Packets',               
                dataIndex   : 'tx_pkts',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2d'
            },
            { 
                text        : 'Inbound IF',               
                dataIndex   : 'inbound_if',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2e'
            },
            { 
                text        : 'IF Name',               
                dataIndex   : 'ifname',
                tdCls       : 'gridTree',  
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn2f'
            },          
            { 
                text        : "<i class=\"fa fa-heartbeat\"></i> "+'Last Seen',   
                dataIndex   : 'modified_in_words',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){    
                    var heartbeat;
                    var value = record.get('state');
                    if(value != 'never'){                    
                        var last_contact     = record.get('modified_in_words');
                        if(value == 'up'){
                            heartbeat =  "<div class=\"fieldGreen\">"+last_contact+"</div>";
                        }
                        if(value == 'down'){
                            heartbeat = "<div class=\"fieldRed\">"+last_contact+"</div>";
                        }

                    }else{
                        heartbeat = "<div class=\"fieldBlue\">Never</div>";
                    }
                    return heartbeat;
                                 
                },stateId: 'StateGridAccSsn3'
            },
            { 
                text        : 'Uptime',   
                dataIndex   : 'uptime',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){    
                    var heartbeat;
                    var value = record.get('uptime');
                    if(value != 0){                    
                        return "<div class=\"fieldGreyWhite\">"+value+"</div>";
                    }else{
                        return "<div class=\"fieldBlue\">0</div>";
                    }                              
                },stateId: 'StateGridAccSsn4'
            },
            { 
                text        : 'Rate Limit (kbps)',               
                dataIndex   : 'rate_limit',
                tdCls       : 'gridMain', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn6'
            },
            { 
                text        : 'Rx-Bytes',               
                dataIndex   : 'rx_bytes_raw',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "{[Ext.ux.bytesToHuman(values.rx_bytes_raw)]}"
                ),
                tdCls       : 'gridMain', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn7'
            },
            { 
                text        : 'Tx-Bytes',               
                dataIndex   : 'tx_bytes_raw',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "{[Ext.ux.bytesToHuman(values.tx_bytes_raw)]}"
                ),
                tdCls       : 'gridMain', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccSsn8'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridAccSsn9',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                width       : 200
            }, 
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 75,
                stateId     : 'StateGridAccSsn10',
                items       : [					 
                    { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
					
					{  
                        iconCls : 'txtBlue x-fa fa-chain-broken',
                        tooltip : 'Disconnect',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'disconnect');
                        }
					}
				]
	        }      
        ]; 
        me.callParent(arguments);
    },
    onStoreAccelSessionsMetachange: function(store,meta_data) {
        var me          = this;
        console.log(meta_data);
        me.down('#totals').setData(meta_data);
        me.down('#totalsData').setData(meta_data);
    }
});
