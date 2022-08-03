Ext.define('Rd.view.profileComponents.gridProfileComponents' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridProfileComponents',
    multiSelect: true,
    store : 'sProfileComponents',
    stateful: true,
    stateId: 'StateGridProfileComponents',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake4/rd_cake/profile-components/menu-for-grid.json',
    plugins     : 'gridfilters',
    initComponent: function(){
        var me  = this;         
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
            { text: i18n('sName'),                   dataIndex: 'name',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridProfileComponents3'},
            { text: i18n('sCheck_attribute_count'),  dataIndex: 'check_attribute_count',  tdCls: 'gridTree', flex: 1,stateId: 'StateGridProfileComponents4'},
            { text: i18n('sReply_attribute_count'),  dataIndex: 'reply_attribute_count',  tdCls: 'gridTree', flex: 1,stateId: 'StateGridProfileComponents5'},
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridProfileComponents8',
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
