Ext.define('Rd.view.schedules.gridSchedules' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridSchedules',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StGSch',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.store.sSchedules',
        'Rd.model.mSchedule',
        'Rd.view.schedules.vcSchedules',
        'Rd.view.schedules.cmbScheduleOptions',
        'Rd.view.schedules.winScheduleAddWizard',
        'Rd.view.schedules.winScheduleEdit',
        'Rd.view.schedules.winScheduleEntryAdd',
        'Rd.view.schedules.winScheduleEntryEdit'
    ],
    viewConfig  : {
        loadMask:true
    },
    features: [{
        ftype               : 'groupingsummary',
        groupHeaderTpl      : '{name}',
        hideGroupedHeader   : true,
        enableGroupingMenu  : false,
        startCollapsed      : true
    }],
    urlMenu     : '/cake3/rd_cake/schedules/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    controller  : 'vcSchedules',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sSchedules',{});
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
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StGSch1',
                hidden: true
            },
            { text: i18n('sName'),         dataIndex: 'name',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StGSch2'},
            { 
                text            : 'Description',
                dataIndex       : 'description', tdCls: 'gridMain', flex: 1 ,stateId: 'StGSch2a',
                summaryType     : 'count',
                summaryRenderer : function(value, summaryData) {               
                    var type = summaryData.description;
                    if(type == ''){
                        return 'No Schedule Entries';
                    }else{
                        return ((value === 0 || value > 1) ? '(' + value + ' Schedule Entries)' : '(1 Schedule Entries)');
                    }
                }   
            },
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
                },stateId: 'StGSch3'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StGSch4',
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
                stateId		: 'StGSch5'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StGSch6',
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
