Ext.define('Rd.view.topUps.gridTopUpTransactions' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridTopUpTransactions',
    multiSelect : true,
    store       : 'sTopUpTransactions',
    stateful    : true,
    stateId     : 'StateGridTut',
    stateEvents :['groupclick','columnhide'],
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.topUps.vcTopUpTransactions',
    ],
    controller  : 'vcTopUpTransactions',
    viewConfig: {
        loadMask    :true
    },
    urlMenu     : '/cake4/rd_cake/top-up-transactions/menu-for-grid.json',
    plugins     : 'gridfilters',  
    initComponent: function(){
        var me      = this;
         me.bbar     =  [
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
        
        var actions = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"create",   "text": "Create"},
                {"id":"update",   "text": "Update"},
				{"id":"delete",   "text": "Delete"}
            ]
        });
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        
        me.columns  = [
            { 
                text    : i18n('sType'),                 
                dataIndex: 'type',          
                width   : 150,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="type==\'data\'"><div class="rd-badge rd-badge--green"><i class="fa fa-database"></i> '+' '+'Data'+'</div></tpl>',
                    '<tpl if="type==\'days_to_use\'"><div class="rd-badge rd-badge--blue\"><i class="fa fa-clock-o"></i> '+' '+'Days To Use'+'</div></tpl>',
                    '<tpl if="type==\'time\'"><div class="rd-badge rd-badge--amber"><i class="fa fa-hourglass"></i> '+' '+'Time'+'</div></tpl>'
                ),        
                stateId : 'Tut1',
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
                stateId     : 'Tut2'
            },
            { 
                text        : 'Action',                 
                dataIndex   : 'action',          
                tdCls       : 'gridTree', 
                width       : 150,
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<tpl if="action==\'create\'"><div class="rd-badge rd-badge--green"><i class="fa fa-star"></i>  Create</div></tpl>',
                    '<tpl if="action==\'update\'"><div class="rd-badge rd-badge--blue"><i class="fa fa-pen"></i> Update</div></tpl>',
                    '<tpl if="action==\'delete\'"><div class="rd-badge rd-badge--amber"><i class="fa fa-trash"></i> Delete</div></tpl>'
                ),        
                stateId     : 'Tut3',
                filter      : {
                    type    : 'list',
                    store   : actions
                }
            },
            { 
                text        : 'RADIUS Attribute', 
                dataIndex   : 'radius_attribute',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'Tut4'
            }, 
            { 
                text        : 'Old Value', 
                dataIndex   : 'old_value',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'Tut5'
            }, 
            { 
                text        : 'New Value', 
                dataIndex   : 'new_value',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'Tut6',
                renderer    : function(value,metaData,record){
                    var egd = record.get('expired_gap_days');
                    var ad  = record.get('applied_days');
                    var pd  = ad - egd;                 
                    if((record.get('type') == 'days_to_use')&&(egd >0)){
                        value = value + "<div style='font-size:11px;color:#04399f;'><span style='color:orange;'><span class='fa' style='font-family:FontAwesome;'>&#xf05a;</span></span>  "+pd+" purchased + "+egd+" expired gap = "+ad+" added</div>";

                    }
                    return value;                        
                }            
            }, 
            { 
                text        : 'TopUp ID', 
                dataIndex   : 'top_up_id',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'number'},
                stateId     : 'Tut7'
            },
            { 
                text        : 'Expired Gap Days', 
                dataIndex   : 'expired_gap_days',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true,
                filter      : {type: 'number'},
                stateId     : 'Tut8'
            },
            { 
                text        : 'Applied Days', 
                dataIndex   : 'applied_days',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true,
                filter      : {type: 'number'},
                stateId     : 'Tut9'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-badge\">{created_in_words}</div>"
                ),
                stateId     : 'Tut10',
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
                filter      : {type: 'date',dateFormat: 'Y-m-d'},stateId: 'Tut11'
            }
        ]; 
        me.callParent(arguments);
    }
});
