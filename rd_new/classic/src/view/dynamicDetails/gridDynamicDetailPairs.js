Ext.define('Rd.view.dynamicDetails.gridDynamicDetailPairs' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridDynamicDetailPairs',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridDynamicDetailPairs',
    stateEvents:['groupclick','columnhide'],
    border: false,
    dynamic_detail_id: undefined,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/dynamic-details/menu-for-dynamic-pairs.json',
    columns: [
        /*    {xtype: 'rownumberer',stateId: 'StateGridDynamicDetailPairs1'},*/
            { text: i18n('sName'),          dataIndex: 'name',      tdCls: 'gridMain', flex: 1,stateId: 'StateGridDynamicDetailPairs2'},
            { text: i18n('sValue'),         dataIndex: 'value',     tdCls: 'gridTree', flex: 1,stateId: 'StateGridDynamicDetailPairs3'},
            { text: i18n('sPriority'),      dataIndex: 'priority',  tdCls: 'gridTree', flex: 1,stateId: 'StateGridDynamicDetailPairs4'}
    ],
    initComponent: function(){
        var me      = this;
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        //Create a store specific to this Dynamic Detail
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPair',
            //To force server side sorting:
            remoteSort: true,
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/dynamic-details/index-pair.json',
                extraParams: { 'dynamic_detail_id' : me.dynamic_detail_id },
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message',
                    totalProperty: 'totalCount' //Required for dynamic paging
                },
                api: {
                    destroy  : '/cake3/rd_cake/dynamic-details/delete-pair.json'
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
                    }
                },
                scope: this
            }  
        });
       
        me.callParent(arguments);
    }
});
