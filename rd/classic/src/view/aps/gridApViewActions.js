Ext.define('Rd.view.aps.gridApViewActions' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridApViewActions',
    border		: false,
    stateful	: true,
    multiSelect	: true,
    stateId		: 'StateApVA',
	apId		: '',
    stateEvents	:['groupclick','columnhide'],
    viewConfig	: {
        preserveScrollOnRefresh: true
    },
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Rd.model.mMeshViewNodeAction',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    urlMenu:        '/cake3/rd_cake/ap-actions/menu-for-grid.json',
    urlIndex:       '/cake3/rd_cake/ap-actions/index.json',
    
    plugins: [{
		ptype: 'rowwidget',
		widget: {
			xtype: 'component',
			bind: {
			    html : ['<div class="sectionHeader"><h2>COMMAND</h2></div><div style="background-color:#e6e6e6; padding:10px;">{record.command}</div><div class="sectionHeader"><h2>REPLY</h2></div><div style="background-color:white; padding:5px;">{record.reply_html}</div>']
			},
			cls:'selectable',
			listeners : {
				boxready: function() {
				    Ext.select('.x-grid-rowbody, .x-border-box').selectable();
                }
            }
		},
		getHeaderConfig: function () {
			var defaultIconColumnCfg = this.superclass.getHeaderConfig.apply(this, arguments);

			defaultIconColumnCfg.renderer = function (value, gridcell, record) {
		        if ((record.get('action') == 'execute_and_reply')&&(record.get('status') == 'replied')) {
                    return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation" tabIndex="0"></div>';
                }
			}

			return defaultIconColumnCfg;
		}
	}],
       
    columns: [
     //   {xtype: 'rownumberer',stateId: 'StateGMVNA1'},
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
            dataIndex   : 'action',stateId: 'StateApVA2'
        },
        { 
            text        : i18n('sStatus'),
            flex        : 1,
            tdCls       : 'gridTree',  
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                            "<tpl if='status == \"awaiting\"'><div class=\"fieldBlue\"><i class=\"fa fa-clock-o\"></i> "+i18n('sAwaiting')+"</div></tpl>",
                            "<tpl if='status == \"fetched\"'><div class=\"fieldGreenWhite\"><i class=\"fa fa-check-circle\"></i> "+i18n('sFetched')+"</div></tpl>",
                            "<tpl if='status == \"replied\"'><div class=\"fieldTealWhite\"><i class=\"fa fa-comment\"></i> "+'Replied'+"</div></tpl>"                     
            ),
            dataIndex   : 'status',stateId: 'StateApVA3'
        },
        { text: i18n('sCommand'),    dataIndex: 'command',       tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'StateApVA4'},
        { 
            text        : 'Created',
            dataIndex   : 'created', 
            tdCls       : 'gridTree', 
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<div class=\"fieldGrey\">{created_in_words}</div>"
            ),
            stateId		: 'StateApVA5',
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            flex        : 1,
            sortable    : true
        },  
        { 
            text        : 'Modified',
            dataIndex   : 'modified', 
            tdCls       : 'gridTree',
            xtype       : 'templatecolumn', 
            tpl         : new Ext.XTemplate(
                "<div class=\"fieldGrey\">{modified_in_words}</div>"
            ),
            flex        : 1,
            filter      : {type: 'date',dateFormat: 'Y-m-d'},
            stateId		: 'StateApVA6',
            sortable    : true
        }
        
    ],
    initComponent: function(){

       var me      = this;  
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        //Create a store specific to this Owner
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mMeshViewNodeAction',
            proxy: {
                type: 'ajax',
                format  : 'json',
                batchActions: true, 
                url   : me.urlIndex,
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message'
                },
                api: {
                    destroy  : '/cake3/rd_cake/ap-actions/delete.json'
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
            autoLoad: false    
        });
		me.store.getProxy().setExtraParam('ap_id',me.apId);
		
		me.bbar     =  [
            {
                xtype       : 'pagingtoolbar',
                store       : me.store,
                displayInfo : true,
                plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];
		
        me.callParent(arguments);
    }
});
