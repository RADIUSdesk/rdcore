Ext.define('Rd.view.accessProviders.gridAccessProviders' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridAccessProviders',
    multiSelect : true,
    store       : 'sAccessProvidersGrid',
    stateful    : true,
    stateId     : 'StateGridAccessProviders',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    urlMenu     : '/cake4/rd_cake/access-providers/menu_for_grid.json', 
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this; 
        
        //***Create a menu item and assign it to the grid's menu_grid attribute me.menu_grid
        //The items of each grid's menu will differ and will be determined by the buttons in the grid's toolbar
        me.menu_grid = new Ext.menu.Menu({
           items: [
               { text: 'Change Password', glyph: Rd.config.icnLock,   handler: function(){
                    me.fireEvent('menuItemClick',me,'password'); //Define a handler when the menu item is clicked 
                    //Here we fire an event by the grid (me)
                    //we fire an event called 'menuItemClick' and pass it the grid (me) as well as an ID of the menu ('password')
                    //This we will 'catch' inside the controller
               }},
               { text: 'Enable/Disable',  glyph: Rd.config.icnLight,  handler: function(){
                    me.fireEvent('menuItemClick',me,'disable');
               }}
           ]
        });
        //***
              
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
            {
                text        : i18n('sUsername'),
                sortable    : true,
                flex        : 1,
                dataIndex   : 'username',
                tdCls       : 'gridMain',
                filter      : {type: 'string'}, stateId: 'StateGridAccessProviders3'
            },
            {
                text        : i18n('sName'),
                dataIndex   : 'name',
                flex        : 1,
                filter      : {type: 'string'}, stateId: 'StateGridAccessProviders4'
            },
            {
                text        : i18n('sSurname'),
                dataIndex   : 'surname',
                flex        : 1,
                filter      : {type: 'string'}, stateId: 'StateGridAccessProviders5'
            },
            {
                text        : i18n('sPhone'),
                dataIndex   : 'phone',
                flex        : 1,
                filter      : {type: 'string'}, stateId: 'StateGridAccessProviders6'
            },
            {
                text        : i18n('s_email'),
                flex        : 1,
                dataIndex   : 'email',
                filter      : {type: 'string'}, stateId: 'StateGridAccessProviders7'
            },
            { 
                text        : i18n('sActive'),  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='active == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='active == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridAccessProviders9'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridAccessProviders10',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
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
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridAccessProviders11'
            },
            //*** Add an actioncolumn (xype : actioncolumn)
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridAccessProviders13', //*** (Take the stateId of the last column and add 1 (12+1=13)
                items       : [				
					 { //***This item is always there and can be used as is
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  //***This item is always there and can be used as is
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},{  //***This item is only there is there are 'extra actions' on the toolbar that we want to handle
					    //***It can be used as is since the items in the menu is defined earlier in this file when we created the me.menu_grid
                       iconCls :'txtGreen x-fa fa-bars',
                       tooltip : 'More Actions',
                       handler: function(view, rowIndex, colIndex, item, e, record) {
                           var position = e.getXY();
                           e.stopEvent();
                           me.selRecord = record; //***Assign the record (row) on which this action was done to the grid's selRecord attribute
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
