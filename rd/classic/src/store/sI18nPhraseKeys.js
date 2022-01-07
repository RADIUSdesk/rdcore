Ext.define('Rd.store.sI18nPhraseKeys', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mI18nKey',
    proxy: {
            'type'  :'rest',
            'url'   : '/cake3/rd_cake/phrase_keys',
            format  : 'json', 
            reader: {
                type: 'json',
                rootProperty: 'items'
            }
    },
     listeners: {
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
                            i18n('Database could not be updated'),
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
