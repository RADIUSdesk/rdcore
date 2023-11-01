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
        'gridfilters'
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
                text        : 'Base Config',               
                dataIndex   : 'base_config',
                //hidden      : true,
                tdCls       : 'gridTree',  
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridAccP2'
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
