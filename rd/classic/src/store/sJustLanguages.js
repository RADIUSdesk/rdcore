Ext.define('Rd.store.sJustLanguages', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mI18nLanguage',
    proxy: {
            'type'  :'rest',
            'url'   : '/cake3/rd_cake/languages',
            format  : 'json',
            reader: {
                type: 'json',
                rootProperty: 'items'
            }
    },
    listeners: {
        update: function(store, records, success, options) {
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
        },
        scope: this
    },
    autoLoad: true
});
