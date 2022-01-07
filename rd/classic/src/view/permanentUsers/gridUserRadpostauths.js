Ext.define('Rd.view.permanentUsers.gridUserRadpostauths' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridUserRadpostauths',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridUserRadpostauths',
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
    urlMenu: '/cake3/rd_cake/permanent-users/menu-for-authentication-data.json',
    plugins     : 'gridfilters',  //*We specify this
    columns: [
      //  {xtype: 'rownumberer',stateId: 'StateGridUserRadpostauths1'},
        { text: i18n('sUsername'),      dataIndex: 'username',      tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridUserRadpostauths2'},
        { text: i18n('sPassword'),      dataIndex: 'pass',          tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridUserRadpostauths3'},
        { 
            text            : i18n('sReply'),         
            dataIndex       : 'reply',         
            tdCls           : 'gridTree', 
            flex            : 1,
            filter          : {type: 'string'},
            xtype           : 'templatecolumn',
            tpl             : new Ext.XTemplate(
                            "<tpl if='reply == \"Access-Reject\"'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i>{reply}</div>",
                            '<tpl else>',
                            '<div class=\"fieldGreen\">{reply}</div>',
                            '</tpl>'
                        ),
            stateId: 'StateGridUserRadpostauths4'
        },
        { text: i18n('sNasname'),       dataIndex: 'nasname',       tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridUserRadpostauths5'},
        { text: i18n('sDate'),          dataIndex: 'authdate',      tdCls: 'gridTree', flex: 1,filter: {type: 'date',dateFormat: 'Y-m-d'},stateId: 'StateGridUserRadpostauths6'}
    ],
    username: 'nobody', //dummy value
    initComponent: function(){
        var me      = this;

       
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        //Create a store specific to this Permanent User
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mRadpostauth',
            buffered: false,
            leadingBufferZone: 450, 
            pageSize: 150,
            //To force server side sorting:
            remoteSort: true,
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/radpostauths/index.json',
                extraParams: { 'username' : me.username },
                reader: {
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
