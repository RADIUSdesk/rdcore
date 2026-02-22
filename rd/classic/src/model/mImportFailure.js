Ext.define('Rd.model.mImportFailure', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int' },
        'model',
        'csv_row',
        'identifier',
        'error_type',
        'error_message',
        'payload',
        'created'
    ]
});
