Ext.define('Rd.view.dynamicClients.gridRealmsForDynamicClientCloud' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridRealmsForDynamicClientCloud',
    border      : false,
    requires    :   ['Rd.view.components.advCheckColumn'],
    columns: [
        { text: i18n('sName'),    dataIndex: 'name',      tdCls: 'gridTree', flex: 1},
        {
            xtype: 'advCheckColumn',
            text: 'Include',
            dataIndex: 'selected',
            renderer: function(value, meta, record) {
                var cssPrefix = Ext.baseCSSPrefix,
                cls = [cssPrefix + 'grid-checkheader'],
                disabled = false;
                if (value && disabled) {
                    cls.push(cssPrefix + 'grid-checkheader-checked-disabled');
                } else if (value) {
                    cls.push(cssPrefix + 'grid-checkheader-checked');
                } else if (disabled) {
                    cls.push(cssPrefix + 'grid-checkheader-disabled');
                }
                return '<div class="' + cls.join(' ') + '">&#160;</div>';
            }
        }
    ],
    initComponent: function(){

        var me   = this;
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mRealmForDynamicClientCloud',
            proxy: {
                type            : 'ajax',
                format          : 'json',
                batchActions    : true, 
                url             : '/cake4/rd_cake/realms/list-realms-for-dynamic-client-cloud.json',
                reader          : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                },
                writer      : { 
                    writeAllFields: true 
                },
                api: {
                    read    : '/cake4/rd_cake/realms/list-realms-for-dynamic-client-cloud.json',
                    update  : '/cake4/rd_cake/realms/update-dynamic-client-realm.json'
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
                    }
                },
                update: function(store, records, action, options,a,b) {
                    if(action == 'edit'){ //Filter for edit (after commited a second action will fire called commit)
                        store.sync({
                            success: function(batch,options){
                                Ext.ux.Toaster.msg(
                                    'Updated Realm',
                                    'Updated Realm',
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                );   
                            },
                            failure: function(batch,options){
                                Ext.ux.Toaster.msg(
                                    'Problems Updating Realm',
                                    'Problems Updating Realm',
                                    Ext.ux.Constants.clsWarn,
                                    Ext.ux.Constants.msgWarn
                                );
                            }
                        });
                    }
                },
                scope: this
            },
            autoLoad: false    
        });
        me.callParent(arguments);
    }
});
