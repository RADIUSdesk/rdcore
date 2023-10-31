Ext.define('Rd.view.accel.gridAccelProfiles' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccelProfiles',
    multiSelect : true,
    store       : 'sAccelProfiles',
    stateful    : true,
    stateId     : 'StateGridAccelProfiles',
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
        'Rd.view.accel.vcAccelProfiles',
    ],
    controller  : 'vcAccelProfiles',
    urlMenu     : '/cake4/rd_cake/accel-profiles/menu-for-grid.json',  
    initComponent: function(){
        var me     = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sAccelProfiles');
        me.bbar    =  [
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
                stateId     : 'StateGridAccP1',
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
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree', 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridAccP3',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId     : 'StateGridAccP4'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 100,
                stateId     : 'StateGridAccP5',
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
					}
				]
	        }      
        ]; 
        me.callParent(arguments);
    }
});
