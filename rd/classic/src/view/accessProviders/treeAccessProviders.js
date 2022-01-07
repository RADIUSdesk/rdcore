Ext.define('Rd.view.accessProviders.treeAccessProviders' ,{
    extend      : 'Ext.tree.Panel',
    alias       : 'widget.treeAccessProviders',
    store       : 'sAccessProvidersTreeGrid',
    stateful    : true,
    stateId     : 'StateTreeAccessProviders',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Ext.tree.plugin.TreeViewDragDrop'   
    ],
    urlMenu     : '/cake3/rd_cake/access-providers/menu_for_grid.json', 
    viewConfig  : {
        plugins: {
            treeviewdragdrop: {
                dragText: 'Drag and drop to reorganize'
            }
        }
    },
    selModel: {
      mode: 'SINGLE'
    },
    
    useArrows   : true,
    rootVisible : true,
    rowLines    : true,
    stripeRows  : true,
    border      : false,
    
     initComponent: function(){
        var me      = this; 
        
        //***Create a menu item and assign it to the tree's menu_tree attribute me.menu_tree
        //The items of each tree's menu will differ and will be determined by the buttons in the tree's toolbar
        me.menu_tree = new Ext.menu.Menu({
           items: [
               { text: 'Change Password', glyph: Rd.config.icnLock,   handler: function(){
                    me.fireEvent('menuItemClick',me,'password'); //Define a handler when the menu item is clicked 
                    //Here we fire an event by the tree (me)
                    //we fire an event called 'menuItemClick' and pass it the tree (me) as well as an ID of the menu ('password')
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
                xtype       : 'treecolumn', //this is so we know which column will show the tree
                text        : i18n('sUsername'),
                sortable    : true,
                dataIndex   : 'username',
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'}, stateId: 'StateTreeAccessProviders1',
                renderer    : function(value, meta,record) {
                    if(record.get('style') != undefined){
                        meta.style      = record.get('style');
                    }
                    return value;
                }
            },
            {
                text        : i18n('sName'),
                dataIndex   : 'name',
                tdCls       : 'gridTree',
                flex        : 1,
                filter      : {type: 'string'}, stateId: 'StateTreeAccessProviders2'
            },
            {
                text        : i18n('sSurname'),
                dataIndex   : 'surname',
                tdCls       : 'gridTree',
                filter      : {type: 'string'}, stateId: 'StateTreeAccessProviders3'
            },
            {
                text        : i18n('sPhone'),
                dataIndex   : 'phone',
                tdCls       : 'gridTree',
                filter      : {type: 'string'}, stateId: 'StateTreeAccessProviders4'
            },
            {
                text        : i18n('s_email'),
                flex        : 1,
                dataIndex   : 'email',
                tdCls       : 'gridTree',
                filter      : {type: 'string'}, stateId: 'StateTreeAccessProviders5'
            },
            { 
                text        : i18n('sActive'),  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='active == true'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> "+i18n("sYes")+"</div></tpl>",
                                "<tpl if='active == false'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i> "+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateTreeAccessProviders6'
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
                stateId		: 'StateTreeAccessProviders7',
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
                stateId		: 'StateTreeAccessProviders8'
            },
            { 
                text    : i18n('sNotes'),
                sortable: false,
                hidden  : true, //*** Hide the Notes Column if it is not already hidden (hidden: true)
                width   : 130,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                                "<tpl if='notes == true'><span class=\"fa fa-thumb-tack fa-lg txtGreen\"></tpl>"
                ),
                dataIndex: 'notes', stateId: 'StateTreeAccessProviders9'
            },
            //*** Add an actioncolumn (xype : actioncolumn)
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateTreeAccessProviders10', //*** (Take the stateId of the last column and add 1 (12+1=13)
                items       : [				
					 { //***This item is always there and can be used as is
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						isDisabled: function (tree, rowIndex, colIndex, items, record) {
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
                    {  //***This item is always there and can be used as is
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
                        isDisabled: function (tree, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},{  //***This item is only there is there are 'extra actions' on the toolbar that we want to handle
					    //***It can be used as is since the items in the menu is defined earlier in this file when we created the me.menu_tree
                       iconCls :'txtGreen x-fa fa-bars',
                       tooltip : 'More Actions',
                       handler: function(view, rowIndex, colIndex, item, e, record) {
                           var position = e.getXY();
                           e.stopEvent();
                           me.selRecord = record; //***Assign the record (row) on which this action was done to the tree's selRecord attribute
                           me.view = view;
                           me.menu_tree.showAt(position);
                       }
                    }
				]
            }                  
        ]; 
        me.callParent(arguments);
    }
});
