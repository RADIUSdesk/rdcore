Ext.define('Rd.view.clients.tagClientAps', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagClientAps',
    fieldLabel      : 'APs',
    queryMode       : 'local',
    emptyText       : 'Select APs',
    displayField    : 'name',
    valueField      : 'id',
    name            : 'aps[]',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/clients/client-aps.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
