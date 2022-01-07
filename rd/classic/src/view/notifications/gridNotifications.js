Ext.define('Rd.view.notifications.gridNotifications' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridNotifications',
    multiSelect: false,
    store : 'sNotificationLists',
    stateful: true,
    stateId: 'StateGridNotifications',
    stateEvents:['groupclick','columnhide'],
    border: false,
    allowDeselect: true,
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/notification-lists/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;    
		me.colors = [
			'Purple',
			'Red',
			'Orange',
			'MediumBlue',
			'Turquoise',
			'Green',
			'Orange',
			'Olive',
			'Tomato',
			'Orchid'
		];
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
        
          
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
            {xtype: 'rownumberer',stateId: 'StateGridNotifications1'},
            //{ text: i18n('sOwner'),     dataIndex: 'owner',         tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridNotifications2',
            //    hidden: true
            //},
            { text: i18n('sName'),      dataIndex: 'object_name',          tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridNotifications3'},
            { text: 'Type',      dataIndex: 'related_type',          tdCls: 'gridMain', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridNotifications5'},
            { text: 'Network',    dataIndex: 'parent_name',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridNotifications6'},           
			{ 
                text        : 'Severity',
                xtype       : 'gridcolumn', 
				tdCls		: 'gridMain',
				sortable	: true,
				hideable	: false,
				dataIndex	: 'severity',
				width		: 24,
				stateId		: 'StateGridNotifications7',			
				renderer: function (value, meta, record) {
					var color=''
						fstr = "<div style='width: 10px;height: 10px;background:";
					
					color = me.colors[value];
					
					if(record.get('is_resolved')){
						color = me.colors[5];
					}
					fstr = fstr+color+";border-radius: 50%'></div>";
					return fstr;
				}
			},
            { 
                text        : 'Alert Date',  
                dataIndex   : 'notification_datetime',      
                xtype       : 'gridcolumn', 
                stateId     : 'StateGridNotifications8',
				flex: 1,
				renderer: function (value, meta, record) {
					var dts = Ext.Date.format(value,'m/d/Y');
					
					dts = dts+'</br>'+ Ext.Date.format(value,'H:i'); // 12/11/2013 18:05
					return dts;
				}
            },
            { text: 'Alert Type',    dataIndex: 'notification_type',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridNotifications9'},
            { text: 'Code',    dataIndex: 'notification_code',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridNotifications10'},           
            { text: 'Description',    dataIndex: 'short_description',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},hidden: false,stateId: 'StateGridNotifications11'},           
            { text: 'Full Desc.',    dataIndex: 'description',         tdCls: 'gridMain', flex: 1,filter: {type: 'string'},hidden: true,stateId: 'StateGridNotifications12'},           
			{ 
                text        : 'Resolved',
				tdCls		: 'gridMain',
				sortable	: true,
				hideable	: true,
				hidden		: false,
				dataIndex	: 'modified',
				stateId		: 'StateGridNotifications13',			
				renderer: function (value, meta, record) {
					var dts='';
										
					if(record.get('is_resolved')){
						dts = Ext.Date.format(value,'m/d/Y');
						dts = dts+'</br>'+ Ext.Date.format(value,'H:i'); // 12/11/2013 18:05
					}
					return dts;
				}
			}
        ];
        me.callParent(arguments);
    }
});
