Ext.define('Rd.view.topUps.gridTopUps' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridTopUps',
    multiSelect : true,
    store       : 'sTopUps',
    stateful    : true,
    stateId     : 'StateGridTopUps',
    stateEvents :['groupclick','columnhide'],
    border      : true,
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask    :true
    },
    urlMenu     : '/cake4/rd_cake/top-ups/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me   = this;
        var dash = '<span class="rd-dash">—</span>';
        me.bbar  =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
        
       var types = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"data",       "text": "Data"},
                {"id":"time", 		"text": "Time"},
				{"id":"days_to_use","text": "Days To Use"}
            ]
        });
        
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
            { 
                text    : i18n('sType'),                 
                dataIndex: 'type',          
                width    : 150,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="type==\'data\'"><div class="rd-badge rd-badge--green\"><i class="fa fa-database"></i> '+' '+'Data'+'</div></tpl>',
                    '<tpl if="type==\'days_to_use\'"><div class="rd-badge rd-badge--blue\"><i class="fa fa-clock-o"></i> '+' '+'Days To Use'+'</div></tpl>',
                    '<tpl if="type==\'time\'"><div class="rd-badge rd-badge--amber\"><i class="fa fa-hourglass"></i> '+' '+'Time'+'</div></tpl>'
                ),        
                stateId : 'StateGridTopUps3',
                filter  : {
                    type    : 'list',
                    store   : types
                }
            },
            { 

                text        : 'Permanent user', 
                dataIndex   : 'permanent_user', 
                tdCls       : 'gridTree',         
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'StateGridTopUps4'
            },
            { 

                text        : 'TopUp ID', 
                dataIndex   : 'id',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true,
                filter      : {type: 'number'},
                stateId     : 'StateGridTopUps5'
            },
            { 
                text        : 'Data', 
                dataIndex   : 'data',   
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : {type: 'string'},
                renderer    : function(value,metaData,record){
                    if(record.get('type') == 'data'){
                        return Ext.ux.bytesToHuman(value)
                    }else{
                        return dash;
                    }             
                },
                stateId     : 'StateGridTopUps6'
            },
            { 
                text        : 'Time', 
                dataIndex   : 'time',   
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : {type: 'string'},
                renderer    : function(value,metaData,record){
                    if(record.get('type') == 'time'){
                        return Ext.ux.secondsToHuman(value)  
                    }else{
                        return dash;
                    }                         
                },
                stateId     : 'StateGridTopUps7'
            },
            { 

                text        : 'Days to use', 
                dataIndex   : 'days_to_use',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                renderer    : function(value,metaData,record){
                    if(record.get('type') == 'days_to_use'){
                        return value
                    }else{
                        return dash;
                    }                         
                },
                stateId     : 'StateGridTopUps8'
            },
            { 

                text        : 'Comment', 
                dataIndex   : 'comment',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'StateGridTopUps9'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-badge\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridTopUps10',
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                width       : 150
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-badge\">{modified_in_words}</div>"
                ),
                width       : 150,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},stateId: 'StateGridTopUps11'
            }
        ]; 
        me.callParent(arguments);
    }
});
