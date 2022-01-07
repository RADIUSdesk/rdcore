Ext.define('Rd.model.mI18nMeta', {
    extend: 'Ext.data.Model',
    fields: ['Project-Id-Version','POT-Creation-Date','PO-Revision-Date','Last-Translator','Language-Team','MIME-Version','Content-Type','Content-Transfer-Encoding', 'Plural-Forms'],
    idProperty: 'Project-Id-Version',
    proxy: {
            type: 'ajax',
            //the store will get the content from the .json file
            url: '/cake3/rd_cake/php-phrases/get_metadata.json',
            format  : 'json',
            batchActions: false, 
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message'
            }
    }
});
