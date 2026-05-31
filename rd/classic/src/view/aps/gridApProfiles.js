Ext.define('Rd.view.aps.gridApProfiles' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridApProfiles',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridApProfiles',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    ui          : 'light',
    columnLines : false,
    rowLines    : false,
    stripeRows  : true,
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
        
        me.store    = Ext.create('Rd.store.sApProfiles',{
            listeners: {
                metachange : function(store, metaData) {                   
                    if(me.down('#totals')){ 
                        me.down('#totals').setData(metaData);
                    } 
                },
                scope: me
            },
            autoLoad: true 
        });
           
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
                sortable    : false, // Disables ordering/sorting for this column
                dataIndex   : 'ap_count',     
                tdCls       : 'gridTree',
                stateId     : 'StateGridApProfiles7', 
                width       : Rd.config.gridNumberCol
                
                },
            { 
                text        : 'APs Up',
                sortable    : false, // Disables ordering/sorting for this column  
                dataIndex   : 'aps_up', 
                tdCls       : 'gridTree',     
                xtype       :  'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                            "<tpl if='aps_up &gt; 0'><div><span class='txtGreen'><i class=\"fa fa-circle\"></i></span></span> {aps_up}</div>",
                            "<tpl else><div><span class='txtBlue'><span class='fa' style='font-family:FontAwesome;'>&#xf1db</span></span> {aps_up}</div></tpl>"
                        ),
                stateId     : 'StateGridApProfiles8',
                width       : Rd.config.gridNumberCol
            },

            { 
                text        : 'APs Down',  
                dataIndex   : 'aps_down',
                sortable    : false, // Disables ordering/sorting for this column     
                xtype       :  'templatecolumn', 
                tdCls       : 'gridTree',
                tpl         :    new Ext.XTemplate(
                            "<tpl if='aps_down &gt; 0'><div><span class='txtOrange'><i class=\"fa fa-circle\"></i></span> {aps_down}</div>",
                            "<tpl else><div><span class='txtBlue'><span class='fa' style='font-family:FontAwesome;'>&#xf1db</span></span> {aps_down}</div></tpl>"
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
