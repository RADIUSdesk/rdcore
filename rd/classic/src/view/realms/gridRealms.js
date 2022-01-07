Ext.define('Rd.view.realms.gridRealms' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRealms',
    multiSelect : true,
    store       : 'sRealms',
    stateful    : true,
    stateId     : 'StateGridRealms',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    urlMenu     : '/cake3/rd_cake/realms/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    viewConfig: {
        loadMask:true
    },
    bbar        : [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi'  }
    ],
    initComponent: function(){
        var me      = this;
        me.menu_grid = new Ext.menu.Menu({
            items: [
                { text: 'Graphs', glyph: Rd.config.icnGraph,   handler: function(){
                     me.fireEvent('menuItemClick',me,'graph'); 
                }},
                { text: 'Edit Logo',  glyph: Rd.config.icnCamera,  handler: function(){
                     me.fireEvent('menuItemClick',me,'logo');
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
           // {xtype: 'rownumberer',stateId: 'StateGridRealms1'},
            { text: i18n('sOwner'),    dataIndex: 'owner',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'},stateId: 'StateGridRealms2',
            hidden: true
            },
            { text: i18n('sName'),     dataIndex: 'name',      tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridRealms3'},
            { text: i18n('sPhone'),    dataIndex: 'phone',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGridRealms4'},
            { text: i18n('sFax'),      dataIndex: 'fax',       tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGridRealms5'},
            { text: i18n('sCell'),     dataIndex: 'cell',      tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGridRealms6'},
            { text: i18n('s_email'),   dataIndex: 'email',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGridRealms7'},
            { text: i18n('sURL'),      dataIndex: 'url',       tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGridRealms8'},
			{ text: 'Twitter',      dataIndex: 'twitter',      tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR9'},
			{ text: 'Facebook', 	dataIndex: 'facebook',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR10'},
			{ text: 'Youtube', 		dataIndex: 'youtube',      tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR11'},
			{ text: 'Google+', 		dataIndex: 'google_plus',  	tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR12'},
			{ text: 'LinkedIn', 	dataIndex: 'linkedin', 		tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR13'},
			{ text: 'T&C Title', 	dataIndex: 't_c_title', 	tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR14'},
			{ text: 'T&C Content', 	dataIndex: 't_c_content', 	tdCls: 'gridTree', flex: 1, filter: {type: 'string'},   hidden: true,stateId: 'StateGR15'},
            { 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n('sYes')+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n('sNo')+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                    filter  : {
                        type: 'boolean'    
                },stateId: 'StateGR16'
            },
            {
                text        : 'Client Usage URL',
                width       : 250,
                hidden      : true,
                stateId     : 'StateGR16a',
                dataIndex   : 'client_usage_url',
                xtype       : 'templatecolumn',
                //tpl         : '<a href="https://radiusdesk.com" target="_blank">https://radiusdesk.com</a>'
                tpl         : '<a href="{client_usage_url}" target="_blank">{client_usage_url}</a>'
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
                stateId		: 'StateGR17',
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
                stateId		: 'StateGR18'
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
                dataIndex: 'notes',stateId: 'StateGR19'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGR20',
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
					},{  
                       iconCls :'txtGreen x-fa fa-bars',
                       tooltip : 'More Actions',
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
