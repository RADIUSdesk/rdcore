Ext.define('Rd.view.profiles.gridProfiles' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridProfiles',
    multiSelect : true,
    store       : 'sProfiles',
    stateful    : true,
    stateId     : 'StateGridProfiles',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake4/rd_cake/profiles/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me  = this; 

        me.menu_grid = new Ext.menu.Menu({
            items: [
                { text: 'Simple Edit', glyph: Rd.config.icnEdit,   handler: function(){
                     me.fireEvent('menuItemClick',me,'update'); 
                }},
                { text: 'FUP Edit',  glyph: Rd.config.icnHandshakeO,  handler: function(){
                     me.fireEvent('menuItemClick',me,'fup');
                }},
                { text: 'Advanced Edit',  glyph: Rd.config.icnGears,  handler: function(){
                     me.fireEvent('menuItemClick',me,'advanced_edit');
                }}
            ]
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
            { text: 'ID',               dataIndex: 'id',    flex: 1, stateId: 'StateGridProfiles0', hidden : true},
            { text: i18n('sName'),      dataIndex: 'name',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridProfiles1'},
            { 
                text        :  i18n('sProfile_components'),
                sortable    : false,
                hidden      : false,
                flex        : 1,  
                xtype       : 'templatecolumn',
                tdCls       : 'gridTree',  
                tpl         :    new Ext.XTemplate(
                    '<tpl if="Ext.isEmpty(profile_components)"><div"></div></tpl>',
                    '<tpl for="profile_components">',     // interrogate the profile_components property within the data
                        "<div class=\"fieldGreyWhite\">{groupname} <small><i>(priority => {priority})</i></small></div>",
                    '</tpl>'
                ),
                dataIndex   : 'profile_components',
                stateId     : 'StateGridProfiles2'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridProfiles3',
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
                       handler: function(view, rowIndex, colIndex, item, e, record) {
                           var position = e.getXY();
                           e.stopEvent();
                           me.selRecord = record; 
                           me.view = view;
                           me.menu_grid.showAt(position);
                       }
                    }
				]
            }                              
        ];     
        me.callParent(arguments);
    }
});
