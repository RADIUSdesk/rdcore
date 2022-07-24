Ext.define('Rd.view.devices.gridDeviceRadpostauths' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridDeviceRadpostauths',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridDeviceRadpostauths',
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
    urlMenu: '/cake3/rd_cake/devices/menu-for-authentication-data.json',
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    columns: [
        {xtype: 'rownumberer',stateId: 'StateGridDeviceRadpostauths1'},
        { text: i18n('sUsername'),      dataIndex: 'username',      tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDeviceRadpostauths2'},
        { text: i18n('sPassword'),      dataIndex: 'pass',          tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDeviceRadpostauths3'},
        { 
            text            : i18n('sReply'),         
            dataIndex       : 'reply',         
            tdCls           : 'gridTree', 
            flex            : 1,
            filter          : {type: 'string'},
            xtype           : 'templatecolumn',
            tpl             : new Ext.XTemplate(
                            "<tpl if='reply == \"Access-Reject\"'><div class=\"noRight\">{reply}</div>",
                            '<tpl else>',
                            '{reply}',
                            '</tpl>'
                        ),stateId: 'StateGridDeviceRadpostauths4'
        },
        { text: i18n('sNasname'),       dataIndex: 'nasname',       tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDeviceRadpostauths5'},
        { text: i18n('sDate'),          dataIndex: 'authdate',      tdCls: 'gridTree', flex: 1,filter: {type: 'date',dateFormat: 'Y-m-d'},stateId: 'StateGridDeviceRadpostauths6'}
    ],
    username: 'nobody', //dummy value
    initComponent: function(){
        var me      = this;
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        //Create a store specific to this Permanent User
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mRadpostauth',
            pageSize    : 100,
            remoteSort  : true,
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/radpostauths/index.json',
                extraParams: { 'username' : me.username },
                reader: {
                    keepRawData     : true,
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message',
                    totalProperty: 'totalCount' //Required for dynamic paging
                },
                api: {
                    destroy  : '/cake3/rd_cake/radpostauths/delete.json'
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        //console.log(store.getProxy().getReader().rawData.message.message);
                    }
                },
                scope: this
            },
            autoLoad: false    
        });
        
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
