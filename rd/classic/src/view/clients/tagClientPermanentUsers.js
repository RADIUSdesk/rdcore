Ext.define('Rd.view.clients.tagClientPermanentUsers', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagClientPermanentUsers',
    fieldLabel      : 'Permanent Users',
    queryMode       : 'local',
    emptyText       : 'Select Permanent Users',
    displayField    : 'username',
    valueField      : 'id',
    name            : 'permanent_users[]',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'username',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/clients/client-permanent-users.json',
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
