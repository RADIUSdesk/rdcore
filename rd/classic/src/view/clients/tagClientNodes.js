Ext.define('Rd.view.clients.tagClientNodes', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagClientNodes',
    fieldLabel      : 'Nodes',
    queryMode       : 'local',
    emptyText       : 'Select Nodes',
    displayField    : 'name',
    valueField      : 'id',
    name            : 'nodes[]',
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
                    url     : '/cake4/rd_cake/clients/client-nodes.json',
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
