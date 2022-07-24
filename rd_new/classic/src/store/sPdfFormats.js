Ext.define('Rd.store.sPdfFormats', {
    extend  : 'Ext.data.Store',
    model   : 'Rd.model.mPdfFormat',
    proxy   : {
        type    : 'ajax',
        format  : 'json',
        url     : '/cake3/rd_cake/vouchers/pdfVoucherFormats.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message'
        }
    },
    autoLoad: true
});
