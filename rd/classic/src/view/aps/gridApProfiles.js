Ext.define('Rd.view.aps.gridApProfiles' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridApProfiles',
    multiSelect : true,
    store       : 'sApProfiles',
    stateful    : true,
    stateId     : 'StateGridApProfiles',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig  : {
        loadMask    : true
    },
    urlMenu     : '/cake4/rd_cake/ap-profiles/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
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
            { text: i18n("sName"),      dataIndex: 'name',          tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridApProfiles3'},		
            { 
                text        : 'AP Count',
                dataIndex   : 'ap_count',    
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl><div class=\"fieldGreyWhite\">{ap_count}</div></tpl>"
                        ),  
                stateId     : 'StateGridApProfiles7', 
                width       : Rd.config.gridNumberCol
                
                },
            { 
                text        : 'APs Up',  
                dataIndex   : 'aps_up',      
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl if='aps_up &gt; 0'><div class=\"fieldGreenWhite\">{aps_up}</div>",
                            "<tpl else><div class=\"fieldBlue\">{aps_up}</div></tpl>"
                        ),
                stateId     : 'StateGridApProfiles8',
                width       : Rd.config.gridNumberCol
            },

            { 
                text        : 'APs Down',  
                dataIndex   : 'aps_down',      
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl if='aps_down &gt; 0'><div class=\"fieldRedWhite\">{aps_down}</div>",
                            "<tpl else><div class=\"fieldBlue\">{aps_down}</div></tpl>"
                        ),
                stateId     : 'StateGridApProfiles9',
                width       : Rd.config.gridNumberCol
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridApProfiles11',
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
