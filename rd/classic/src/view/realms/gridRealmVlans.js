Ext.define('Rd.view.realms.gridRealmVlans' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRealmVlans',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridRV',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.realms.vcRealmVlans'
    ],
    urlMenu     : '/cake4/rd_cake/realm-vlans/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    viewConfig: {
        loadMask:true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    controller  : 'vcRealmVlans',
    initComponent: function(){
        var me      = this;     
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.store    = Ext.create('Rd.store.sRealmVlans');
        me.store.getProxy().setExtraParam('realm_id',me.realm_id);
        me.store.load();
        
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        
        
        me.columns  = [
        	{ text: 'ID',           dataIndex: 'id',                            flex: 1, stateId: 'StateGridRV0', hidden : true},      
            { text: 'VLAN',         dataIndex: 'vlan',      tdCls: 'gridMain',  flex: 1, filter: 'number',stateId: 'StateGridRV1'},
            { text: 'Name',         dataIndex: 'name',      tdCls: 'gridTree',  flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridRV2'},
            { text: 'Comment',      dataIndex: 'comment',   tdCls: 'gridTree',  flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridRV3'},
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridRV5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : false, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridRV6'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridRV7',
                items       : [				
					 { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('delete') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
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
