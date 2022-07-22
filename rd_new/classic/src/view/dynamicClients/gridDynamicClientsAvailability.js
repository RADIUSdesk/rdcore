Ext.define('Rd.view.dynamicClients.gridDynamicClientsAvailability' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridDynamicClientsAvailability',
    border: false,
    stateful: true,
    multiSelect: true,
    stateId: 'StateGridDynamicClientsAvailability',
    stateEvents:['groupclick','columnhide'],
    viewConfig: {
        preserveScrollOnRefresh: true
    },
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu:        '/cake3/rd_cake/dynamic-client-states/menu_for_grid.json',
    urlIndex:       '/cake3/rd_cake/dynamic-client-states/index.json',
    columns: [
      //  {xtype: 'rownumberer',stateId: 'StateGridDynamicClientsAvailability1'},
        { 
            text    : i18n('sState'),
            flex    : 1,  
            xtype   : 'templatecolumn', 
            tpl     : new Ext.XTemplate(
                        "<tpl if='state == true'><div class=\"fieldGreen\">"+i18n('sUp')+"</div></tpl>",
                        "<tpl if='state == false'><div class=\"fieldRed\">"+i18n('sDown')+"</div></tpl>"
                    ),
            dataIndex: 'state' ,stateId: 'StateGridDynamicClientsAvailability2'          
        },
        { text: i18n('sDuration'),  dataIndex: 'time',       tdCls: 'gridTree', flex: 1, sortable: false,stateId: 'StateGridDynamicClientsAvailability3'},
        { text: i18n('sStarted'),   dataIndex: 'created',    tdCls: 'gridTree', flex: 1, sortable: true, stateId: 'StateGridDynamicClientsAvailability4'},
        { text: i18n('sEnded'),     dataIndex: 'modified',   tdCls: 'gridTree', flex: 1, sortable: true, stateId: 'StateGridDynamicClientsAvailability5'}
    ],
    initComponent: function(){

        var me  = this; 
        
        //Create a store specific to this Owner
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicClientState',
            pageSize    : 100,
            remoteSort  : true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                format  : 'json',
                batchActions: true, 
                url   : me.urlIndex,
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount'
                },
                api: {
                    destroy  : '/cake3/rd_cake/dynamic-client-states/delete.json'
                }
            },
            listeners: {
                load: function(store, records, successful) {      
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            i18n('sError_encountered'),
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
               
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true
        }];
       
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
             
        me.store.getProxy().setExtraParam('dynamic_client_id',me.dynamic_client_id);       
        me.callParent(arguments);
    }
});
