Ext.define('Rd.store.sI18nPhpPhrases', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mI18nPhpPhrase',
    proxy: {
        'type'  :'rest',
        'url'   : '/cake3/rd_cake/php-phrases',
        format: 'json',
        api: {
        },
        reader: {
            type : 'json',
            rootProperty: 'items'
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
        update: function(store, records, action, options,a,b) {
            if(action == 'edit'){ //Filter for edit (after commited a second action will fire called commit)
                store.sync({
                    success: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sUpdated_database'),
                            i18n('sDatabase_has_been_updated'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );   
                    },
                    failure: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sProblems_updating_the_database'),
                            i18n('sDatabase_could_not_be_updated'),
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }
                });
            }
        },
        scope: this
    },
    autoLoad: true    
});
