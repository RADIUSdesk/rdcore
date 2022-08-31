Ext.define('Rd.view.clouds.tagAccessProviders', {
    extend          : 'Ext.form.field.Tag',
    alias           : 'widget.tagAccessProviders',
    fieldLabel      : 'Admins',
    queryMode       : 'local',
    //emptyText       : 'Additional Admins',
    displayField    : 'name',
    valueField      : 'id',
    name            : 'admins[]',
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
                    url     : '/cake4/rd_cake/access-providers/ap-tag-list.json',
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
