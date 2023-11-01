Ext.define('Rd.view.accel.gridAccelServers' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccelServers',
    multiSelect : true,
    store       : 'sAccelServers',
    stateful    : true,
    stateId     : 'StateGridAccelServers',
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
        'gridfilters',
        {
            ptype       : 'rowexpander',
            rowBodyTpl  : new Ext.XTemplate(
                '<div class="plain-wrap">',                 
            		'<tpl if="accel_stat">',
            		    '<div class="main" style="color:#145218;background:#e6e6e6">',
                			'Health',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
			    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
			    				'<span style="color:#515152;font-weight:100;display: inline-block; width: 100px;">Uptime</span>{accel_stat.uptime}',
			    			'</div>',
			    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
			    				'<span style="color:#515152;font-weight:100;display: inline-block; width: 100px;">CPU</span>{accel_stat.cpu}',
			    			'</div>',
			    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
			    				'<span style="color:#515152;font-weight:100;display: inline-block; width: 100px;">Memory</span>{accel_stat.mem}',
			    			'</div>',
    					'</div>',            		    
    					'<div class="main" style="color:#145218;background:#e6e6e6">',
                			'Sessions',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
    					    '<tpl for="accel_stat.sessions">',
				    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
				    				'<span style="color:#a3a3a3;font-weight:100;display: inline-block; width: 100px;">{[Ext.ux.splitCapital(values.name)]}</span>{value}',
				    			'</div>',
				    		'</tpl>',
    					'</div>',
    					'<div class="main" style="color:#145218;background:#e6e6e6">',
                			'PPPoE',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
    					    '<tpl for="accel_stat.pppoe">',
				    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
				    				'<span style="color:#a3a3a3;font-weight:100;display: inline-block; width: 140px;">{[Ext.ux.splitCapital(values.name)]}</span>{value}',
				    			'</div>',
				    		'</tpl>',
    					'</div>',
    					'<div class="main" style="color:#145218;background:#e6e6e6">',
                			'Core',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
    					    '<tpl for="accel_stat.core">',
				    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
				    				'<span style="color:#a3a3a3;font-weight:100;display: inline-block; width: 180px;">{[Ext.ux.splitCapital(values.name)]}</span>{value}',
				    			'</div>',
				    		'</tpl>',
    					'</div>',
    					'<div class="main" style="color:#145218;background:#e6e6e6">',
                			'RADIUS 1',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
    					    '<tpl for="accel_stat.radius1">',
				    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
				    				'<span style="color:#a3a3a3;font-weight:100;display: inline-block; width: 180px;">{[Ext.ux.splitCapital(values.name)]}</span>{value}',
				    			'</div>',
				    		'</tpl>',
    					'</div>',
    					'<div class="main" style="color:#145218;background:#e6e6e6">',
                			'RADIUS 2',
                		'</div>',
            		    '<div class="sub" style="background:#ffff">',
    					    '<tpl for="accel_stat.radius2">',
				    			'<div style="font-size:16px;color:#282852;text-align:left;padding-left:20px;padding-top:3px;padding-bottom:3px;">',
				    				'<span style="color:#a3a3a3;font-weight:100;display: inline-block; width: 180px;">{[Ext.ux.splitCapital(values.name)]}</span>{value}',
				    			'</div>',
				    		'</tpl>',
    					'</div>',
    				'<tpl else>',
    				    '<div class="sub">',
    					    '<div style="font-size:25px;color:#9999c7;text-align:left;padding-left:20px;padding-top:10px;"> No Stats Available</div>',
    					'</div>',
    				'</tpl>',
            	'</div>'
            )
        }
    ],
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.accel.vcAccelServers',
    ],
    controller  : 'vcAccelServers',
    urlMenu     : '/cake4/rd_cake/accel-servers/menu-for-grid.json',  
    initComponent: function(){
        var me     = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sAccelServers');
        me.store.addListener('metachange',  me.onStoreAccelServersMetachange, me);
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
                text        : 'Name',               
                dataIndex   : 'name',
                tdCls       : 'gridMain', 
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS1',
                renderer    : function(value,metaData, record){
                	var flag    = record.get('restart_service_flag');
                	var value   = record.get('name');
                	if(flag == 1){
                	    return "<i class=\"fa fa-gears\" style=\"color:orange;\"></i> "+value;
                	}
                    return value;	             
                }
            },
            { 
                text        : 'MAC Address',               
                dataIndex   : 'mac',
                hidden      : true,
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS2'
            },
            { 
                text        : 'Profile',               
                dataIndex   : 'profile',
                hidden      : true,
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS2a'
            },
            { 
                text        : 'Interface',               
                dataIndex   : 'pppoe_interface',
                hidden      : true,
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS2b'
            },
            { 
                text        : 'NAS Identifier',               
                dataIndex   : 'nas_identifier',
                hidden      : true,
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccS2c'
            },
            { 
                text        : "<i class=\"fa fa-gears\"></i> "+'Config Fetched', 
                dataIndex   : 'config_fetched',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){
                    var config_fetched_human     = record.get('config_fetched_human');  
                    var config;
                    var value = record.get('config_state');
                    if(value != 'never'){                    
                        if(value == 'up'){
                            config =  "<div class=\"fieldGreen\">"+config_fetched_human+"</div>";
                        }
                        if(value == 'down'){
                            config = "<div class=\"fieldGrey\">"+config_fetched_human+"</div>";
                        }

                    }else{
                        config = "<div class=\"fieldBlue\">Never</div>";
                    }
                    return config;
                                 
                },stateId: 'StateGridAccS3',
                hidden: false
            },
            { 
                text        : "<i class=\"fa fa-heartbeat\"></i> "+'Heartbeat Received',   
                dataIndex   : 'last_contact',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){    
                    var heartbeat;
                    var value = record.get('state');
                    if(value != 'never'){                    
                        var last_contact     = record.get('last_contact_human');
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
                                 
                },stateId: 'StateGridAccS4'
            },
            { 

                text        : 'From IP', 
                dataIndex   : 'last_contact_from_ip',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true, 
                xtype       :  'templatecolumn', 
                 tpl         :  new Ext.XTemplate(
                    '<div class=\"fieldGreyWhite\">{last_contact_from_ip}</div>',
                    "<tpl if='Ext.isEmpty(city)'><tpl else>",
                        '<div><b>{city}</b>  ({postal_code})</div>',
                    "</tpl>",
                    "<tpl if='Ext.isEmpty(country_name)'><tpl else>",
                        '<div><b>{country_name}</b> ({country_code})</div>',
                    "</tpl>"   
                ), 
                filter		: {type: 'string'},stateId: 'StateGridNodeLists8a'
            },
            { 
                text        : "<i class=\"fa fa-chain \"></i> "+'Active Sessions',   
                dataIndex   : 'sessions_active',  
                tdCls       : 'gridTree', 
                flex        : 1,
                renderer    : function(val,metaData, record){    
                    var heartbeat;
                    var value = record.get('sessions_active');
                    if(value != 0){                    
                        return "<div class=\"fieldGreyWhite\">"+value+"</div>";
                    }else{
                        return "<div class=\"fieldBlue\">0</div>";
                    }                              
                },stateId: 'StateGridAccS5'
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
                        return "<div class=\"fieldGrey\">"+value+"</div>";
                    }else{
                        return "<div class=\"fieldBlue\">0</div>";
                    }                              
                },stateId: 'StateGridAccS6'
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
                stateId     : 'StateGridAccS7',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                width       : 200
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId     : 'StateGridAccS8'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 100,
                stateId     : 'StateGridAccS9',
                items       : [					 
                    { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},
					{ 
						iconCls : 'txtRed x-fa fa-gear',
						tooltip : 'Restart Service',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'restart');
                        }
                    },
					{  
                        iconCls : 'txtBlue x-fa fa-chain',
                        tooltip : 'Show Active Sessions',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'sessions');
                        }
					}
				]
	        }      
        ]; 
        me.callParent(arguments);
    },
    onStoreAccelServersMetachange: function(store,meta_data) {
        var me          = this;
        me.down('#totals').setData(meta_data);
    }
});
