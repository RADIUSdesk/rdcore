Ext.define('Rd.view.topUps.gridTopUpTransactions' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridTopUpTransactions',
    multiSelect : true,
    store       : 'sTopUpTransactions',
    stateful    : true,
    stateId     : 'StateGridTut',
    stateEvents :['groupclick','columnhide'],
    border      : true,
    padding     : 10,
    viewConfig  : {
        loadMask    :true
    },
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
        
        me.columns  = [
            { xtype: 'rownumberer',stateId: 'StateGridTut1'},
            { 

                text        :'Owner', 
                dataIndex   : 'user',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'},
                stateId     : 'StateGridTut2',
                hidden      : true
            },
            { 
                text    : i18n('sType'),                 
                dataIndex: 'type',          
                tdCls   : 'gridTree', 
                flex    : 1,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="type==\'data\'"><div class="fieldGreyWhite"><i class="fa fa-database"></i> '+' '+'Data'+'</div></tpl>',
                    '<tpl if="type==\'days_to_use\'"><div class="fieldPurpleWhite"><i class="fa fa-clock-o"></i> '+' '+'Days To Use'+'</div></tpl>',
                    '<tpl if="type==\'time\'"><div class="fieldBlueWhite"><i class="fa fa-hourglass"></i> '+' '+'Time'+'</div></tpl>'
                ),        
                stateId : 'StateGridTut3',
                filter  : {
                    type    : 'list',
                    store   : types
                }
            },
            { 
                text        : 'Permanent user', 
                dataIndex   : 'permanent_user',          
                tdCls       : 'gridMain', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'StateGridTut4'
            },
            { 
                text        : 'Action',                 
                dataIndex   : 'action',          
                tdCls       : 'gridTree', 
                flex        : 1,
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<tpl if="action==\'create\'"><div class="fieldGreenWhite"><i class="fa fa-star"></i>  Create</div></tpl>',
                    '<tpl if="action==\'update\'"><div class="fieldBlueWhite"><i class="fa fa-pen"></i> Update</div></tpl>',
                    '<tpl if="action==\'delete\'"><div class="fieldRedWhite"><i class="fa fa-trash"></i> Delete</div></tpl>'
                ),        
                stateId     : 'StateGridTut5',
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
                stateId     : 'StateGridTut6'
            }, 
            { 
                text        : 'Old Value', 
                dataIndex   : 'old_value',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'StateGridTut7'
            }, 
             { 
                text        : 'New Value', 
                dataIndex   : 'new_value',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'string'},
                stateId     : 'StateGridTut8'
            }, 
            { 
                text        : 'TopUp ID', 
                dataIndex   : 'top_up_id',          
                tdCls       : 'gridTree', 
                flex        : 1,
                hidden      : false,
                filter      : {type: 'number'},
                stateId     : 'StateGridTut9'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId     : 'StateGridTut10',
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
                filter      : {type: 'date',dateFormat: 'Y-m-d'},stateId: 'StateGridTut11'
            }
        ]; 
        me.callParent(arguments);
    }
});
