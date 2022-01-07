Ext.define('Rd.view.predefinedCommands.gridPredefinedCommands' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridPredefinedCommands',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StGSch',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.store.sPredefinedCommands',
        'Rd.model.mPredefinedCommand',
        'Rd.view.predefinedCommands.vcPredefinedCommands',
        'Rd.view.predefinedCommands.winPredefinedCommandsAddWizard',
        'Rd.view.predefinedCommands.winPredefinedCommandEdit'
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/predefined-commands/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    controller  : 'vcPredefinedCommands',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sPredefinedCommands',{});
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
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'PreCmd1',
                hidden: true
            },
            { text: i18n('sName'),         dataIndex: 'name',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'PreCmd2'},
            { 
                text        : i18n('sAction'),
                flex        : 1,
                tdCls       : 'gridTree',  
                xtype       : 'templatecolumn',
                sortable    : true, 
                tpl         : new Ext.XTemplate(
         "<tpl if='action == \"execute\"'><div class=\"fieldGrey\"><i class=\"fa fa-cogs\"></i> "+'Execute'+"</div></tpl>",
         "<tpl if='action == \"execute_and_reply\"'><div class=\"fieldGreyWhite\"><i class=\"fa fa-cogs\"></i> "+'Execute <i class="fa fa-comment"></i> Reply'+"</div></tpl>"                   
                ),
                dataIndex   : 'action',stateId: 'PreCmd2a'
            },
            { text: 'Command',             dataIndex: 'command',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'PreCmd3'},
            { 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                tdCls       : 'gridTree',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'PreCmd4'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'PreCmd5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'PreCmd6'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'PreCmd7',
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
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'edit');
                        }
					}
				]
            }                             
        ];        
        me.callParent(arguments);
    }
});
