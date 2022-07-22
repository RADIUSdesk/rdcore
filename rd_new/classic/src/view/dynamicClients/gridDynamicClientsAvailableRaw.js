Ext.define('Rd.view.dynamicClients.gridDynamicClientsAvailableRaw' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridDynamicClientsAvailableRaw',
    border      : false,
    stateful    : true,
    multiSelect : true,
    stateId     : 'StateGridDynamicClientsAvailableRaw',
    stateEvents : ['groupclick','columnhide'],
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu     : '/cake3/rd_cake/alive/menu_for_grid.json',
    urlIndex    : '/cake3/rd_cake/alive/index.json',
    plugins     : 'gridfilters',  //*We specify this
    columns: [
        { text: 'MCC',          dataIndex: 'mcc',       tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw3', hidden: true,filter: {type: 'string'}},
        { text: 'Band',         dataIndex: 'band',      tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw4',filter: {type: 'string'}},
        { text: 'Signal',       dataIndex: 'sig',       tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw5',filter: {type: 'string'}},
        { text: 'Debug',        dataIndex: 'debug',     tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw6', hidden: true,filter: {type: 'string'}},
        { text: 'Operator',     dataIndex: 'operator',  tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw7', hidden: false,filter: {type: 'string'}},
        { text: 'Rband',        dataIndex: 'rband',     tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw8', hidden: true,filter: {type: 'string'}},
        { text: 'Time',         dataIndex: 'time',      tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw9', hidden: false,filter: {type: 'string'}},
        { text: 'Country',      dataIndex: 'country',   tdCls: 'gridTree', flex: 1, sortable: true,stateId: 'Raw10',hidden: false,filter: {type: 'string'}}
    ],
    initComponent: function(){

        var me  = this;        
        //Create a store specific to this Owner
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mAlive',
            pageSize    : 100,
            remoteSort  : true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                format  : 'json',
                batchActions: true, 
                url   : me.urlIndex,
                reader  : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount'
                },
                api: {
                    destroy  : '/cake3/rd_cake/alive/delete.json'
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
              
        me.tbar  = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});          
        me.store.getProxy().setExtraParam('dynamic_client_id',me.dynamic_client_id);       
        me.callParent(arguments);
    }
});
