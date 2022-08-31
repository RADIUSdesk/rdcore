Ext.define('Rd.view.softflows.gridSoftflows' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridSoftflows',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridSoftflows',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.store.sSoftflows',
        'Rd.model.mSoftflow'
    ],
    viewConfig  : {
        loadMask    : true
    },
    plugins     : 'gridfilters', 
    emptyText   : '<h1>No Results Available</h1>', 
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sSoftflows',{});
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        me.columns  = [
            {
                text        : i18n('sUsername'),      
                dataIndex   : 'username',      
                tdCls       : 'gridMain',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsa'
            },
            {
                text        : 'MAC Address',      
                dataIndex   : 'src_mac',      
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsb'
            },
            {
                text        : 'From IP Address',      
                dataIndex   : 'src_ip',      
                tdCls       : 'gridTree',
                hidden      : true,
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsc'
            },
            {
                text        : 'To IP Address',      
                dataIndex   : 'dst_ip',      
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsd'
            },
            {
                text        : 'From Port',      
                dataIndex   : 'src_port',      
                tdCls       : 'gridTree',
                hidden      : true,
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowse'
            },
            {
                text        : 'To Port',      
                dataIndex   : 'dst_port',      
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsf'
            },
            {
                text        : 'Proto Number',      
                dataIndex   : 'proto',      
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflowsg'
            },
            {
                text        : 'Packet In',      
                dataIndex   : 'pckt_in',      
                tdCls       : 'gridTree',
                hidden      : true,
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflows1'
            },
            {
                text        : 'Packet Out',      
                dataIndex   : 'pckt_out',      
                tdCls       : 'gridTree',
                hidden      : true,
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'StateGridSoftflows2'
            },
            { text: i18n('sData_in'), dataIndex: 'oct_in',    tdCls: 'gridTree', flex: 1,
                renderer: function(value){
                    return Ext.ux.bytesToHuman(value)              
                },stateId: 'StateGridSoftflows3'
            },
            { text: i18n('sData_out'), dataIndex: 'oct_out',    tdCls: 'gridTree', flex: 1,
                renderer: function(value){
                    return Ext.ux.bytesToHuman(value)              
                },stateId: 'StateGridSoftflows4'
            },   
            { 
                text        : 'Started',
                dataIndex   : 'start', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{start_in_words}</div>"
                ),
                stateId		: 'StateGridSoftflows5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Finished',
                dataIndex   : 'finish', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{finish_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridSoftflows6'
            }, 
            
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridSoftflows7',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridSoftflows8'
            }
        ];        
        me.callParent(arguments);
    }
});
