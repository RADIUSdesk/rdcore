Ext.define('Rd.view.ispSpecifics.gridIspSpecifics' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridIspSpecifics',
    multiSelect : true,
    store       : 'sIspSpecifics',
    stateful    : true,
    stateId     : 'StateGridIspS',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    urlMenu     : '/cake4/rd_cake/isp-specifics/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    viewConfig: {
        loadMask:true
    },
    bbar        : [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi'  }
    ],
    initComponent: function(){
        var me      = this;
        
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        
        me.columns  = [
        	{ text: 'ID',           dataIndex: 'id',        flex: 1, stateId: 'StateGridIspS0', hidden : true},      
            { text: i18n('sName'),  dataIndex: 'name',      tdCls: 'gridMain', flex: 1, filter: {type: 'string'}, stateId: 'StateGridIspS2'},
            { text: 'Region',    	dataIndex: 'region',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridIspS3'},
            { text: 'Field1',    	dataIndex: 'field1',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridIspS4'},
            { text: 'Field2',    	dataIndex: 'field2',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridIspS5'},
            { text: 'Field3',    	dataIndex: 'field3',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridIspS6'},
            { text: 'Field4',    	dataIndex: 'field4',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: false,stateId: 'StateGridIspS7'},
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridIspS8',
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
                stateId		: 'StateGridIspS9'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridIspS10',
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
