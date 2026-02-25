Ext.define('Rd.view.hardwares.gridHardwares' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridHardwares',
    xtype : 'gridHardwares',
    multiSelect: true,
    store : 'sHardwares',
    stateful: true,
    stateId: 'StateGridHardwares',
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
    urlMenu : '/cake4/rd_cake/hardwares/menu_for_grid.json',
    plugins : [
        'gridfilters'
    ],  //*We specify this
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

        console.log("H");

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
           { 
                text        : i18n('sName'),
                dataIndex   : 'name',
                flex        : 1,
                filter      : {type: 'string'},
                stateId     : 'gHw1',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    '<div style="text-align:left;"><a href="javascript:void(0)" class="grid-link">{name}</a></div>',
                )
            },
           { text: 'Vendor',              dataIndex: 'vendor', flex: 1,filter: {type: 'string'},stateId: 'gHw2'},
            { text: 'Model',               dataIndex: 'model',  flex: 1,filter: {type: 'string'},stateId: 'gHw3'},
            { text: 'Firmware ID',         dataIndex: 'fw_id',  flex: 1,filter: {type: 'string'},stateId: 'gHw4',hidden: true},
            { 
                text        : 'Radio Count',
                dataIndex   : 'radio_count',
                flex        : 1,
                filter      : {type: 'number'},
                stateId     : 'gHw5',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='radio_count == 0'><div class=\"rd-chip rd-chip--gray\">{radio_count}</div></tpl>",
                    "<tpl if='radio_count == 1'><div class=\"rd-chip rd-chip--green\">{radio_count}</div></tpl>",
                    "<tpl if='radio_count == 2'><div class=\"rd-chip rd-chip--blue\">{radio_count}</div></tpl>",
                    "<tpl if='radio_count == 3'><div class=\"rd-chip rd-chip--teal\">{radio_count}</div></tpl>",
                )
            },
            { 
                text        : 'For Mesh',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_mesh == true'><div class=\"rd-chip rd-chip--green\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_mesh == false'><div class=\"rd-chip rd-chip--gray\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_mesh',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'gHw6'
            },
            { 
                text        : 'For AP',  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_ap == true'><div class=\"rd-chip rd-chip--green\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_ap == false'><div class=\"rd-chip rd-chip--gray\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_ap',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'gHw7'
            },
            { 
                text        : 'System Wide', 
                xtype       : 'templatecolumn',
                width       : 120,
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_system == true'><div class=\"rd-chip rd-chip--green\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_system == false'><div class=\"rd-chip rd-chip--gray\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_system',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'gHw8'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--teal\">{created_in_words}</div>"
                ),
                stateId		: 'gHw9',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'gHw10'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                
                stateId     : 'gHw11',
                items       : [				
					 { 
						iconCls : 'x-fa fa-trash',
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
                        iconCls : 'x-fa fa-pen',
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
					},
					{  
                        iconCls : 'x-fa fa-camera',
                        tooltip : 'Edit photo',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'photo');
                        }
					}
				]
            }           
        ];   
        me.callParent(arguments);
    }
});
