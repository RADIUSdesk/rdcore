Ext.define('Rd.view.nas.gridNasAvailability' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridNasAvailability',
    border: false,
    stateful: true,
    multiSelect: true,
    stateId: 'StateGridNasAvailability',
    stateEvents:['groupclick','columnhide'],
    viewConfig: {
        preserveScrollOnRefresh: true
    },
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu:        '/cake3/rd_cake/na-states/menu_for_grid.json',
    urlIndex:       '/cake3/rd_cake/na-states/index.json',
    columns: [
        {xtype: 'rownumberer',stateId: 'StateGridNasAvailability1'},
        { 
            text    : i18n('sState'),
            flex    : 1,  
            xtype   : 'templatecolumn', 
            tpl     : new Ext.XTemplate(
                        "<tpl if='state == true'><div class=\"fieldGreen\">"+i18n('sUp')+"</div></tpl>",
                        "<tpl if='state == false'><div class=\"fieldRed\">"+i18n('sDown')+"</div></tpl>"
                    ),
            dataIndex: 'state' ,stateId: 'StateGridNasAvailability2'          
        },
        { text: i18n('sDuration'),  dataIndex: 'time',       tdCls: 'gridTree', flex: 1, sortable: false,stateId: 'StateGridNasAvailability3'},
        { text: i18n('sStarted'),   dataIndex: 'start',      tdCls: 'gridTree', flex: 1, sortable: false,stateId: 'StateGridNasAvailability4'},
        { text: i18n('sEnded'),     dataIndex: 'end',        tdCls: 'gridTree', flex: 1, sortable: false,stateId: 'StateGridNasAvailability5'}
    ],
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    initComponent: function(){

       var me      = this;  
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        //Create a store specific to this Owner
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mNaState',
            proxy: {
                type: 'ajax',
                format  : 'json',
                batchActions: true, 
                url   : me.urlIndex,
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                },
                api: {
                    destroy  : '/cake3/rd_cake/na_states/delete.json'
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
                    }else{
                        var count   = me.getStore().getTotalCount();
                        me.down('#count').update({count: count});
                    }  
                },
                update: function(store, records, success, options) {
                    store.sync({
                        success: function(batch,options){
                           
                        },
                        failure: function(batch,options){
                          
                        }
                    });
                },
                scope: this
            },
            autoLoad: false    
        });
        
        
        me.callParent(arguments);
    }
});
